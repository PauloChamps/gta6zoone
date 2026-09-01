import {intro} from './common.mjs';export default (p,root)=>({...p,body:`${intro(p,root)}<section class="section"><div class="container article">${p.content}</div></section>`});
