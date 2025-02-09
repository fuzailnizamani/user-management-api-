const Employee = require('../model/Employee');

const getAllEmployees = async (req, res) => {
  const employees = await Employee.find();
  if (!employees) return res.status(204).json({ 'message': 'No Employees found.' });
  res.json(employees);
};

const createNewEmployees = async (req, res) => {

  // Check if required fields are provided
  if (!req.body.firstname || !req.body.lastname) {
    return res.status(400).json({ 'message': 'First and last names are required.' });
  }

  try {
    const result = await Employee.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname
    });
    res.status(201).json(result);

  } catch (err) {
    // Handle errors (e.g., if there's a problem with the database)
    res.status(500).json({ 'message': 'Error creating employee', error: err });
  }
};

const updateEmployees = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ "message": 'ID parameter is required.' })
  }
  const employee = await Employee.findOne({ _id: req.body.id }).exec();
  if (!employee) {
    return res.status(204).json({ "message": `no employee matches ID ${req.body.id}` });
  }
  if (req.body?.firstname) employee.firstname = req.body.firstname;
  if (req.body?.lastname) employee.lastname = req.body.lastname;
  const result = await employee.save();
  res.json(result);
};

const deleteEmployees = async (req, res) => {
  const employeeId = req.body.id; // Check body for id
  if (!employeeId) {
    return res.status(400).json({ "message": "Employee ID required." });
  }
  const result = await Employee.findOneAndDelete({ _id: employeeId });
  if (!result) {
    return res.status(204).json({ "message": `No employee matches ID ${employeeId}` });
  }
  res.json(result);
};

const getEmployees = async (req, res) => {
  if (req?.body?.id) {
    return res.status(400).json({ "message": 'ID parameter is required.' });
  }
  const employee = await Employee.findOne({ _id: req.params.id });
  if (!employee) {
    return res.status(204).json({ "message": `No employee matches ID ${req.params._id}` });
  }
  res.json(employee);
};

module.exports = {
  getAllEmployees,
  createNewEmployees,
  updateEmployees,
  deleteEmployees,
  getEmployees
};