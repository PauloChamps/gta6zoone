import { intro } from './common.mjs';export default (page,root)=>({...page,body:`${intro(page,root)}<section class="section"><div class="container article">${page.content||''}</div></section>`});
