const Doctor = require("../models/Doctor");

const initDataLoader = async () => {
  try {
    // const doctorCount = await Doctor.countDocuments();
    // if (doctorCount === 0) {
    //   const sampleDoctors = [
    //     { name: "Dr. John Doe", speciality: "Cardiology", hourRate: 100 },
    //     { name: "Dr. Jane Smith", speciality: "Neurology", hourRate: 150 },
    //   ];

    //   await Doctor.insertMany(sampleDoctors);
    //   console.log("Sample data for doctors initialized.");
    // }
    
    // else {
    //   console.log("Doctors already exist. Skipping data initialization.");
    // }
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};

module.exports = initDataLoader;
