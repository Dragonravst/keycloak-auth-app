const info = {
  sizePerPage: 10,
  page: 2,
};

const filterInfo = {
  payerName: "MEDICARE",
  payerType: "Insurance",
  // year: 2025,
  // month: 9,
  // responsibleProvider: "Lipton, Mark",
  // resource: "Lipton, Mark",
  // supervisingProvider: "N/A",
  sizePerPage: 10,
  page: 1,
};

const revenueInfo = {
  payerName: "MEDICARE",
  year: 2025,
  month: 9,
  responsibleProvider: ["Lipton, Mark", "Sirota, Anna"],
  resource: ["Lipton, Mark", "Sirota, Anna",],
  supervisingProvider: ["N/A",],
  sizePerPage: 10,
  page: 1,
};


const resourceInfo = {
  responsible_provider: "Sirota, Anna",
}

const supervisingInfo = {
  responsible_provider: "Sirota, Anna",
  resource: "Sirota, Anna",
  supervising_provider: "Sirota, Anna",
}

const pageValue = {
  sizePerPage: '10',
  page: "1"
}

const dataValueForPatientFilteredCase = {
  facilityName: ["arun", "geetha"],
  sizePerPage: "10",
  page: "1",
  startDate: "2025-08-08",
  endDate: "2025-10-08"
}
const dataValueForProjectFilteredCase = {
  sizePerPage: "10",
  page: "1",
  payerName: ["arun", "geetha"],
  providerName: "David",
  services: "Instrument",
  startDate: "2025-08-08",
  endDate: "2025-10-08"
}
const dataValueForUsers = {
  sizePerPage: "10",
  page: "1",
  isActive: "0"
};
const dataValueForSuperBillsCase = {
  sizePerPage: "10",
  page: "1",
  patientLastName: "gee"
}
const dataValueForSuperBillsFilteredCase = {
  sizePerPage: "10",
  page: "1",
  patientLastName: "geetha",
  startDate: "2025-08-08",
  endDate: "2025-10-08"
}
const dataValueForFilteredOfficeVisits={
  sizePerPage: "10",
  page: "1",
  patientName:"king",
  status:"submitted",
  startDate: "2025-08-08",
  endDate: "2025-10-08"
}

const dataValueForFilteredPayerReports={
  sizePerPage: "10",
  page: "1",
  payerName:"arun",
  services:"instrument",
  providerName:"geetha",
  status:"pending"
}
const payload = btoa(JSON.stringify(dataValueForFilteredPayerReports));
console.log(payload);

