const DoctorModel = {
  async all(params){ return Api.getDoctors(params); },
  async specialties(){ return Api.getSpecialties(); },
  async branches(){ return Api.getBranches(); },
  async slots(doctorId){ return Api.getDoctorSlots(doctorId); }
};
