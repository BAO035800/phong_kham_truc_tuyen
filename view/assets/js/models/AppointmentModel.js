const AppointmentModel = {
  async book(payload){ return Api.bookAppointment(payload); },
  async mine(){ return Api.myAppointments(); },
  async cancel(id){ return Api.cancelAppointment(id); }
};
