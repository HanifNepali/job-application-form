import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  experienceSchema,
  type ExperienceData,
  type ExperienceFormValues,
} from "./schema";
import { FieldTextInput } from "@/components/FieldTextInput";
import { FieldCheckbox } from "@/components/FieldCheckbox";
import { Button } from "@/components/Button";
import { useFormStore } from "@/store/formStore";
import { STEPS } from "@/lib/steps";
import { StepHeader } from "@/components/StepHeader";

export function ExperienceStep() {
  const navigate = useNavigate();
  const data = useFormStore((s) => s.data.experience);
  const updateExperience = useFormStore((s) => s.updateExperience);
  const setFurthestUnlockedStep = useFormStore(
    (s) => s.setFurthestUnlockedStep,
  );

  const blankRole = () => ({
    id: crypto.randomUUID(),
    company: "",
    title: "",
    startDate: "",
    endDate: "",
    isCurrentRole: false,
  });

  // useForm has three generics exist for exactly this situation
  // 1st i.e ExperienceFormValue -  defines the input state shape of the actual form elements in the UI
  // 2nd - unknown i.e Context value being passed to the resolver, which is not used in this case.
  // Context acts a "backdoor" variable that lets you pass dynamic information from your React component straight into your Zod validation schema at runtime.
  // 3rd - ExperienceData- defines the final output state shape of your data after it successfully passes through your Zod schema validations and transformations.
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormValues, unknown, ExperienceData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      currentRole: data.currentRole,
      yearsOfExperience: data.yearsOfExperience?.toString() ?? "",
      pastRoles: data.pastRoles.length > 0 ? data.pastRoles : [blankRole()],
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  // Why data.pastRoles.length > 0 ? data.pastRoles : [blankRole()] and not just always seeding one blindly
  // a returning user who already filled in real roles has data.pastRoles populated from the store
  // — seeding a blank on top of their real data would either duplicate a row or silently override what they'd saved.

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pastRoles",
    keyName: "fieldId", // avoid colliding with PastRole's own real `id` field
  });

  // Live values for every row, so each row can see its siblings'
  // isCurrentRole state and react to it — `fields` from useFieldArray only
  // gives stable identity keys for .map(), not live field values.
  const watchedRoles = useWatch({ control, name: "pastRoles" });

  const handleCurrentRoleChange = (index: number, checked: boolean) => {
    setValue(`pastRoles.${index}.isCurrentRole`, checked, {
      shouldValidate: true,
    });

    if (checked) {
      fields.forEach((_, j) => {
        if (j !== index) {
          setValue(`pastRoles.${j}.isCurrentRole`, false, {
            shouldValidate: true,
          });
        }
      });
      setValue(`pastRoles.${index}.endDate`, "", { shouldValidate: true }); // was: undefined
    }
  };

  const onSubmit = (values: ExperienceData) => {
    updateExperience(values); // values.yearsOfExperience is a real number here
    setFurthestUnlockedStep(2);
    navigate(`/form/${STEPS[2].path}`);
  };

  return (
    <>
      <StepHeader title={STEPS[1].label} description={STEPS[1].pageSubHeader} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mb-8">
          <FieldTextInput
            label="Current Role / Title"
            error={errors.currentRole?.message}
            {...register("currentRole")}
          />
          <FieldTextInput
            label="Total Years of Experience"
            type="number"
            min={0}
            error={errors.yearsOfExperience?.message}
            {...register("yearsOfExperience")}
          />
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => {
            const isCurrent = watchedRoles?.[index]?.isCurrentRole ?? false;

            return (
              <div
                key={field.id}
                className="space-y-4 rounded-lg border border-line p-4"
              >
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mb-8">
                  <FieldTextInput
                    label="Company"
                    error={errors.pastRoles?.[index]?.company?.message}
                    {...register(`pastRoles.${index}.company`)}
                  />
                  <FieldTextInput
                    label="Title"
                    error={errors.pastRoles?.[index]?.title?.message}
                    {...register(`pastRoles.${index}.title`)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mb-4">
                  <FieldTextInput
                    label="Start Date"
                    type="date"
                    error={errors.pastRoles?.[index]?.startDate?.message}
                    {...register(`pastRoles.${index}.startDate`)}
                  />
                  {/* Fully unmounted, not disabled, when this role is current —
                    matches the project's existing screen-reader-first stance
                    (aria-live, role="alert") rather than leaving a disabled
                    ghost field a screen reader would still announce. */}
                  {!isCurrent && (
                    <FieldTextInput
                      label="End Date"
                      type="date"
                      error={errors.pastRoles?.[index]?.endDate?.message}
                      {...register(`pastRoles.${index}.endDate`)}
                    />
                  )}
                </div>

                <FieldCheckbox
                  label="I currently work here"
                  name={`pastRoles.${index}.isCurrentRole`}
                  error={errors.pastRoles?.[index]?.isCurrentRole?.message}
                  checked={isCurrent}
                  onChange={(e) =>
                    handleCurrentRoleChange(index, e.target.checked)
                  }
                />

                {fields.length > 1 && (
                  <Button variant="outline" onClick={() => remove(index)}>
                    Remove this role
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <Button variant="outline" onClick={() => append(blankRole())}>
          Add Role
        </Button>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            Next
          </Button>
        </div>
      </form>
    </>
  );
}
