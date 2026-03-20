import { type ReactNode } from "react";

interface FormFooterProps {
  children: ReactNode;
}

export default function FormFooter({ children }: FormFooterProps) {
  return (
    <>
      <hr className="mt-10 border-line" />
      <div className="flex justify-end pt-2">{children}</div>;
    </>
  );
}
