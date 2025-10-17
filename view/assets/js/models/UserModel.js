const UserModel = {
  getCurrent(){
    try{ return JSON.parse(localStorage.getItem("currentUser")||"null"); }catch(_){ return null; }
  },
  setCurrent(u){
    localStorage.setItem("currentUser", JSON.stringify(u));
  },
  clear(){ localStorage.removeItem("currentUser"); },
  isLoggedIn(){ return !!UserModel.getCurrent(); }
};
