import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
// Demo-only insurance system. In-memory data; x-role is NOT real authentication.
const policies = new Map();
const allow = {applicant:['create','read','withdraw'],underwriter:['read','approve'],admin:['read','issue']};
const send=(res,status,obj)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(obj));};
const read=async(req)=>{let s='';for await(const part of req)s+=part;if(s.length>100000)throw Error('Too large');return s?JSON.parse(s):{};};
const ui=`<!doctype html><html><head><title>Insurance Policy Lab</title></head><body><h1>Policy Lab</h1>
<label>Customer <input id="customer" value="Test Customer"></label>
<label>Premium <input id="premium" type="number" value="1000"></label>
<button id="create">Create policy</button><label>Policy ID <input id="id"></label>
<button id="approve">Approve</button><button id="issue">Issue</button>
<pre role="status" id="result"></pre><script>
async function call(path,role,data){const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json','x-role':role},body:JSON.stringify(data||{})});const j=await r.json();document.querySelector('#result').textContent=JSON.stringify({code:r.status,...j});return j;}
document.querySelector('#create').onclick=async()=>{const p=await call('/api/policies','applicant',{customer:document.querySelector('#customer').value,premium:Number(document.querySelector('#premium').value)});if(p.id)document.querySelector('#id').value=p.id;};
document.querySelector('#approve').onclick=()=>call('/api/policies/'+document.querySelector('#id').value+'/approve','underwriter');
document.querySelector('#issue').onclick=()=>call('/api/policies/'+document.querySelector('#id').value+'/issue','admin');
</script></body></html>`;
createServer(async(req,res)=>{
try {
 const u=new URL(req.url,'http://localhost'),p=u.pathname.split('/').filter(Boolean),role=req.headers['x-role']||'guest';
 if(req.method==='GET'&&u.pathname==='/health')return send(res,200,{ready:true});
 if(req.method==='GET'&&u.pathname==='/'){res.writeHead(200,{'content-type':'text/html'});return res.end(ui);}
 if(p[0]!=='api'||p[1]!=='policies')return send(res,404,{error:'NOT_FOUND'});
 const action=p.length===2?'create':p.length===3?'read':p[3];
 if(!allow[role]?.includes(action))return send(res,403,{error:'FORBIDDEN'});
 if(req.method==='POST'&&action==='create'){
 const data=await read(req);
 if(!data.customer?.trim()||!Number.isFinite(data.premium)||data.premium<100)return send(res,422,{error:'INVALID_INPUT'});
 const policy={id:randomUUID(),customer:data.customer,premium:data.premium,balance:data.premium,status:'SUBMITTED',version:1};
 policies.set(policy.id,policy);return send(res,201,policy);
 }
 const policy=policies.get(p[2]);
 if(!policy)return send(res,404,{error:'POLICY_NOT_FOUND'});
 if(req.method==='GET'&&action==='read')return send(res,200,policy);
 if(req.method==='POST'&&action==='approve'){
 if(policy.status!=='SUBMITTED')return send(res,409,{error:'INVALID_STATE'});
 policy.status='APPROVED';policy.version++;return send(res,200,policy);
 }
 if(req.method==='POST'&&action==='issue'){
 if(policy.status!=='APPROVED')return send(res,409,{error:'INVALID_STATE'});
 policy.status='ISSUED';policy.version++;return send(res,200,policy);
 }
 if(req.method==='POST'&&action==='withdraw'){
 if(policy.status!=='ISSUED')return send(res,409,{error:'INVALID_STATE'});
 const {amount}=await read(req);
 if(!Number.isFinite(amount)||amount<=0||amount>policy.balance/2)return send(res,422,{error:'WITHDRAWAL_LIMIT'});
 policy.balance=Math.round((policy.balance-amount)*100)/100;policy.version++;return send(res,200,policy);
 }
 return send(res,404,{error:'NOT_FOUND'});
}catch(e){return send(res,400,{error:'BAD_REQUEST'});}
}).listen(Number(process.env.PORT||4177),'127.0.0.1');