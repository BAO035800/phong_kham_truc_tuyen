const validator = {
  isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
  isPhone(v){ return /^(\+?\d{7,15})$/.test(v.trim()); },
  notEmpty(v){ return v && v.trim().length>0; },
  date(v){ return !Number.isNaN(Date.parse(v)); },
  time(v){ return /^\d{2}:\d{2}$/.test(v); },
};
