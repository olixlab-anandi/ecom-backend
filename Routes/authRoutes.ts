import express from 'express'
import { login, register } from '../Controller/user';
import { check } from "express-validator"



const router = express.Router();

router.post("/login", [
    check('email', "Enter valid Email").isEmail(),
    check('password', "password Must be atleast 6 character").isLength({
        max: 20,
        min: 6
    })
], login);

router.post("/register",
    [
        check("firstName", "First Name is Required").not().isEmpty(),
        check("lastName", "Last name is Required").not().isEmpty(),
        check('email', "Enter valid Email").isEmail(),
        check('password', "password Must be atleast 6 character").isLength({
            max: 20,
            min: 6
        }),
        check('confirm_password', "confirm_password Must be atleast 6 character").isLength({
            max: 20,
            min: 6
        }),
    ]

    , register);



export default router
