import {test,expect} from '@playwright/test';
test('@smoke @hybrid create via UI, approve and issue, validate by API',async({page,request})=>{
 await page.goto('/');
 await page.getByLabel('Customer').fill('Hybrid '+crypto.randomUUID());
 await page.getByLabel('Premium').fill('2000');
 await page.getByRole('button',{name:'Create policy'}).click();
 const idField=page.getByLabel('Policy ID');
 await expect(idField).not.toHaveValue('');
 const id=await idField.inputValue();
 const initial=await request.get('/api/policies/'+id,{headers:{'x-role':'applicant'}});
 expect((await initial.json()).status).toBe('SUBMITTED');
 await page.getByRole('button',{name:'Approve'}).click();
 await expect(page.getByRole('status')).toContainText('APPROVED');
 await page.getByRole('button',{name:'Issue'}).click();
 await expect(page.getByRole('status')).toContainText('ISSUED');
 const result=await request.get('/api/policies/'+id,{headers:{'x-role':'applicant'}});
 expect(await result.json()).toMatchObject({status:'ISSUED',balance:2000,version:3});
});
test('@regression @hybrid invalid premium is rejected in browser',async({page})=>{
 await page.goto('/');
 await page.getByLabel('Premium').fill('25');
 await page.getByRole('button',{name:'Create policy'}).click();
 await expect(page.getByRole('status')).toContainText('INVALID_INPUT');
 await expect(page.getByLabel('Policy ID')).toHaveValue('');
});