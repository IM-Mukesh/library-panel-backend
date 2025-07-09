import Student from "../models/Student";

const generateRollNumber = async (code: string): Promise<string> => {
  const last = await Student.find({ rollNumber: { $regex: `^${code}` } })
    .sort({ createdAt: -1 })
    .limit(1);
  const lastRollNumber = last[0]?.rollNumber ?? `${code}0000`;
  const numericPart = lastRollNumber.slice(code.length); // safely get the number part
  const lastNum = parseInt(numericPart) || 0;
  const newNum = String(lastNum + 1).padStart(4, "0");

  return `${code}${newNum}`;
};

export default generateRollNumber;
