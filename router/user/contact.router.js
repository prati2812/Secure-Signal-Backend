import { Router } from 'express';
import { addEmergencyContact, fetchEmergencyContactList, findMatchingContacts, removeSelectedContact } from '../../controller/user/contact.controller.js';
import { authentication } from '../../middleware/authentication.js';


const contactRouter = Router();


contactRouter.post("/emergencyContact" , authentication , addEmergencyContact);
contactRouter.post("/fetchContacts" , authentication , fetchEmergencyContactList);
contactRouter.post("/findMatchingContacts" , authentication ,findMatchingContacts);
contactRouter.post("/removeSelectedContact" ,authentication , removeSelectedContact);


export default contactRouter;