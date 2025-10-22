import { body } from "express-validator";

export const validateAgentStore = [
  body("name").notEmpty().withMessage("Name is required"),
  body("communication_style").notEmpty().withMessage("Communication style is required"),
  body("behavior").optional().isString(),
  body("purpose").optional().isString(),
  body("company_support").optional().isString(),
  body("company_description").optional().isString(),
  body("ai_provider").optional().isString(),
  body("ai_model").optional().isString(),
];

export const validateAgentUpdate = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("communication_style").optional().notEmpty().withMessage("Communication style cannot be empty"),
  body("behavior").optional().isString(),
  body("purpose").optional().isString(),
  body("company_support").optional().isString(),
  body("company_description").optional().isString(),
  body("ai_provider").optional().isString(),
  body("ai_model").optional().isString(),
];

export const validateUseAgent = [
  body("message").notEmpty().withMessage("Message cannot be empty"),
  body("session_id").notEmpty().withMessage("Session ID cannot be empty"),
  body("user_id").notEmpty().withMessage("User ID cannot be empty"),
];
