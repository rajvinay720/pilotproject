import {test,expect,type APIRequestContext} from '@playwright/test';
const headers=(role:string)=>({'x-role':role});
async function create(request:APIRequestContext){
 const r=await request.post('/api/policies',{headers:headers('applicant'),data:{customer:'Test '+crypto.randomUUID(),premium:1000}});
 expect(r.status()).toBe(201);return r.json();
}
test('@smoke @api policy lifecycle including financial withdrawal',async({request})=>{
 const p=await create(request);
 expect(p.status).toBe('SUBMITTED');
 const approval=await request.post('/api/policies/'+p.id+'/approve',{headers:headers('underwriter')});
 expect(approval.status()).toBe(200);
 const issue=await request.post('/api/policies/'+p.id+'/issue',{headers:headers('admin')});
 expect(issue.status()).toBe(200);
 const withdrawal=await request.post('/api/policies/'+p.id+'/withdraw',{headers:headers('applicant'),data:{amount:250}});
 expect(withdrawal.status()).toBe(200);
 expect((await withdrawal.json())).toMatchObject({status:'ISSUED',balance:750,version:4});
});
test('@regression @api applicant cannot approve and state does not change',async({request})=>{
 const p=await create(request);
 const denied=await request.post('/api/policies/'+p.id+'/approve',{headers:headers('applicant')});
 expect(denied.status()).toBe(403);
 const get=await request.get('/api/policies/'+p.id,{headers:headers('applicant')});
 expect((await get.json()).status).toBe('SUBMITTED');
});
test('@regression @api withdrawal limit protects balance',async({request})=>{
 const p=await create(request);
 await request.post('/api/policies/'+p.id+'/approve',{headers:headers('underwriter')});
 await request.post('/api/policies/'+p.id+'/issue',{headers:headers('admin')});
 const invalid=await request.post('/api/policies/'+p.id+'/withdraw',{headers:headers('applicant'),data:{amount:501}});
 expect(invalid.status()).toBe(422);
 const get=await request.get('/api/policies/'+p.id,{headers:headers('applicant')});
 expect((await get.json()).balance).toBe(1000);
});
test('@regression @api five simultaneous issuance requests only one succeeds',async({request})=>{
 const p=await create(request);
 await request.post('/api/policies/'+p.id+'/approve',{headers:headers('underwriter')});
 const results=await Promise.all(Array.from({length:5},()=>request.post('/api/policies/'+p.id+'/issue',{headers:headers('admin')})));
 expect(results.filter(x=>x.status()===200)).toHaveLength(1);
 expect(results.filter(x=>x.status()===409)).toHaveLength(4);
});