import axios from "axios";
import { API_AI_SERVER } from "../constants";

const http = axios.create({ baseURL: `${API_AI_SERVER}/` });

export const spellCheck = (spell, lang) => {
  return http.post("/nlp/spell-check", {
    text_input: spell,
    dict: lang,
  });
};

export const detectLanguage = (text) => {
  return http.post(`/nlp/detect-language`, {
    text_input: text,
  });
};

export const predictText = (language, text) => {
  return http.post(`/nlp/predict-next-word`, {
    dict: language,
    algorithm: "nltk",
    text_input: text,
  });
};

export const summaryText = (lang, text) => {
  return http.post(`/nltk/extract-summary`, {
    text_input: text,
    total_sentences: 5,
    dict: lang,
  });
};

export const getWordSuggestion = (spell) => {
  return http.get(`/nlp/suggested-word?word=${spell}`);
};

export const sentimentText = (text) => {
  return http.post(`/nltk/extract-sentiment`, {
    text_input: text,
  });
};

export const grammarCheck = (lang, text) => {
  return http.post(`/nlp/grammar-check`, {
    text_input: text,
    dict: lang,
  });
};
