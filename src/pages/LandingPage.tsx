import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { useFormStore } from "@/store/formStore";
import { STEPS } from "@/lib/steps";

export function LandingPage() {
  const navigate = useNavigate();
  const furthestUnlockedStep = useFormStore((s) => s.furthestUnlockedStep);

  const handleGoToForm = () => {
    navigate(`/form/${STEPS[furthestUnlockedStep].path}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="max-w-240 space-y-6">
        <h1 className="font-serif text-4xl font-semibold text-ink mb-15">
          Job Application Form
        </h1>

        <div className="mb-12">
          <p className="text-lg text-ink-secondary mb-6">
            This form walks through everything a hiring team typically needs —
            your personal details, work experience, skills and links, a resume
            upload, and your availability — broken into short, focused steps
            rather than one long page. A progress indicator tracks where you are
            throughout, and you're free to move between any step you've already
            reached to review or change what you entered.
          </p>

          <p className="text-lg text-ink-secondary">
            Before anything is submitted, you'll see a complete summary of every
            answer with the option to jump back and edit any section. Your
            progress is saved automatically as you go, so if you leave partway
            through, picking up again will return you right where you left off.
          </p>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-ink-secondary">
          {furthestUnlockedStep === 0
            ? "Ready to Start?"
            : "Continue where you left off?"}
        </h3>
        <Button variant="primary" onClick={handleGoToForm} className="min-w-35">
          Go to Form
        </Button>
      </div>
    </div>
  );
}
