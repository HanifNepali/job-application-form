import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { skillsLinksSchema, type SkillsLinksData } from "./schema";
import { FieldTextInput } from "@/components/FieldTextInput";
import { FieldChipsInput } from "@/components/FieldChipsInput";
import { ChipList } from "@/components/ChipList";
import { useFormStore } from "@/store/formStore";
import { STEPS } from "@/lib/steps";
import { useCallback, useEffect } from "react";
import { StepHeader } from "@/components/StepHeader";
import { useUnsavedChangesWarning } from "@/lib/hooks";
import { UnsavedChangesModal } from "@/components/UnsavedChangesModal";
import FormFooter from "@/components/FormFooter";
import NextButton from "@/components/NextButton";

export function SkillsLinksStep() {
  const navigate = useNavigate();
  const data = useFormStore((s) => s.data.skillsLinks);
  const updateSkillsLinks = useFormStore((s) => s.updateSkillsLinks);
  const setFurthestUnlockedStep = useFormStore(
    (s) => s.setFurthestUnlockedStep,
  );
  const STEP_INDEX = 2; // this file's own position in STEPS — 1 for Experience, 2 for Skills & Links, etc.
  const furthestUnlockedStep = useFormStore((s) => s.furthestUnlockedStep);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SkillsLinksData>({
    resolver: zodResolver(skillsLinksSchema),
    defaultValues: data,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Called once — the resulting `field` object is handed to both columns
  // below, rather than mounting two <Controller name="skills"> instances,
  // which would create two competing registrations for the same field.

  // useController({ name: "skills", control }) is the hook form of <Controller>
  // — functionally identical, just returning its render-prop's arguments directly
  // instead of requiring a render={(props) => ...} wrapper.
  // It registers "skills" with RHF exactly once and hands back three things:

  // field — { value, onChange, onBlur, name, ref }, the same four/five props <Controller>'s render prop gives you
  // fieldState — { error, isDirty, isTouched }, scoped to just this one field (this is where skillsError comes from)
  // formState — the whole form's state, rarely needed here since useForm's own formState is already in scope
  const {
    field: skillsField,
    fieldState: { error: skillsError },
  } = useController({ name: "skills", control });

  // Destructure the stable ref function directly
  const { ref: hookFormRef } = skillsField;

  const { blocker, allowNextNavigation } = useUnsavedChangesWarning(isDirty);

  const onSubmit = (values: SkillsLinksData) => {
    updateSkillsLinks(values);
    setFurthestUnlockedStep(3);
    allowNextNavigation();
    navigate(`/form/${STEPS[3].path}`);
  };

  /**
   * Stable wrapper to safely attach the DOM element to React Hook Form.
   * Prevents "Cannot access refs during render" errors.
   *
   * @see {@link ../../../documentation/callback-refs.md} For full implementation details.
   */
  const setSkillsRef = useCallback(
    (node: HTMLInputElement | null) => {
      hookFormRef(node);
    },
    [hookFormRef],
  );

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
      <StepHeader title={STEPS[2].label} description={STEPS[2].pageSubHeader} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Col 1 — all inputs */}
          <div className="space-y-8">
            <FieldChipsInput
              ref={setSkillsRef}
              label="Skills"
              name="skills"
              value={skillsField.value}
              onChange={skillsField.onChange}
              onBlur={skillsField.onBlur}
              error={skillsError?.message}
              placeholder="Type a skill and press Enter"
            />

            <FieldTextInput
              label="Portfolio URL"
              error={errors.portfolioUrl?.message}
              {...register("portfolioUrl")}
            />
            <FieldTextInput
              label="GitHub URL"
              error={errors.githubUrl?.message}
              {...register("githubUrl")}
            />
            <FieldTextInput
              label="LinkedIn URL"
              error={errors.linkedinUrl?.message}
              {...register("linkedinUrl")}
            />
          </div>

          {/* Col 2 — added skills, driven by the same field object */}
          <div>
            <ChipList
              title="Added Skills"
              items={skillsField.value}
              onRemove={(item) =>
                skillsField.onChange(
                  skillsField.value.filter((s) => s !== item),
                )
              }
            />
          </div>
        </div>

        <FormFooter>
          <NextButton isSubmitting={isSubmitting} formHasError={hasErrors} />
        </FormFooter>
      </form>

      <UnsavedChangesModal blocker={blocker} />
    </>
  );
}
