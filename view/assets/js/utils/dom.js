const $ = (sel, parent=document)=> parent.querySelector(sel);
const $$ = (sel, parent=document)=> [...parent.querySelectorAll(sel)];
