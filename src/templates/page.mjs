import {intro} from './common.mjs';export default (p,root)=>({...p,body:p.rawBody||`${intro(p,root)}${p.content||''}`});
