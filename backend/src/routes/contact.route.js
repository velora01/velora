import express from "express";
import { createContact, getContacts } from "../controllers/contactController.js";

const contactRoute = express.Router();

contactRoute.post("/", createContact);
contactRoute.get("/", getContacts);

export default contactRoute;
