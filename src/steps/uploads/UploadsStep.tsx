import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { uploadsSchema, type UploadsData } from "./schema";
import { FieldFileInput } from "@/components/FieldFileInput";
import { useFileStore } from "@/store/fileStore";
import { useFormStore } from "@/store/formStore";
import { STEPS } from "@/lib/steps";
import { StepHeader } from "@/components/StepHeader";
import { useEffect } from "react";
import FormFooter from "@/components/FormFooter";
import NextButton from "@/components/NextButton";

export function UploadsStep() {
  const navigate = useNavigate();
  const resume = useFileStore((s) => s.resume);
  const coverLetter = useFileStore((s) => s.coverLetter);
  const setResume = useFileStore((s) => s.setResume);
  const setCoverLetter = useFileStore((s) => s.setCoverLetter);
  const setFurthestUnlockedStep = useFormStore(
    (s) => s.setFurthestUnlockedStep,
  );
  const STEP_INDEX = 3; // this file's own position in STEPS — 1 for Experience, 2 for Skills & Links, etc.
  const furthestUnlockedStep = useFormStore((s) => s.furthestUnlockedStep);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<UploadsData>({
    resolver: zodResolver(uploadsSchema),
    defaultValues: {
      resume: resume ?? undefined, // fileStore: null → RHF's expected undefined
      coverLetter, // already File | null, matches coverLetterSchema's .nullable()
      // The TypeScript error happens because state variable resume is typed as File | null,
      // but the React Hook Form default value expects File | undefined
      // (which is what Zod defaults to when a field is required).

      // No mode/reValidateMode here — onBlur-first timing is a text-typing
      // concern (don't flag errors mid-keystroke). A file selection is a
      // single discrete, complete action, so validating it immediately on
      // selection (via the explicit trigger() calls below) is the correct
      // behavior here, not premature the way it would be for a text field.
    },
  });

  const onSubmit = () => {
    // resume/coverLetter are already written into fileStore by each
    // Controller's onChange below, as the user picks them — this form's
    // own state is just the validation harness, not the source of truth.
    setFurthestUnlockedStep(4);
    navigate(`/form/${STEPS[4].path}`);
  };

  // Check if any errors exist explicitly:
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (furthestUnlockedStep > STEP_INDEX) {
      trigger(); // no argument = validate the whole step, populate every field's error at once
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // deliberately once-on-mount only — see note below

  return (
    <>
      <StepHeader title={STEPS[3].label} description={STEPS[3].pageSubHeader} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Controller
          name="resume"
          control={control}
          render={({ field }) => (
            <FieldFileInput
              label="Resume"
              name="resume"
              value={field.value}
              onChange={(file) => {
                field.onChange(file);
                setResume(file);
                trigger("resume");
              }}
              error={errors.resume?.message}
            />
          )}
        />

        <Controller
          name="coverLetter"
          control={control}
          render={({ field }) => (
            <FieldFileInput
              label="Cover Letter (optional)"
              name="coverLetter"
              value={field.value}
              onChange={(file) => {
                field.onChange(file);
                setCoverLetter(file);
                trigger("coverLetter");
              }}
              error={errors.coverLetter?.message}
            />
          )}
        />

        <FormFooter>
          <NextButton isSubmitting={isSubmitting} formHasError={hasErrors} />
        </FormFooter>
      </form>
    </>
  );
}
