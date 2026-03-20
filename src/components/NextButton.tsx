import { Button } from "./Button";

interface NextButtonProps {
  isSubmitting: boolean;
  formHasError: boolean;
}

export default function NextButton({
  isSubmitting,
  formHasError,
}: NextButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting || formHasError}
      className="min-w-30"
    >
      Next
    </Button>
  );
}
