import type { ChangeEvent, ElementType, RefObject } from "react";

export type allInputFieldsProps = {
  icon?: ElementType;
  isDropDown?: boolean;
  type?: string;
  placeholder?: string;
  value?: string;
  name: string;
  label?: string;
  labelFor?: string;
  required?: boolean;
  error?: string;
  multiple?: boolean;
  accept?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  options?:{label:string,value:string}[];
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};
