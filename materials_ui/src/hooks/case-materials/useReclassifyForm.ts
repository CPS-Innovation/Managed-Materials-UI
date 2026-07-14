import { useState } from 'react';
import { CaseMaterialsType } from '../../schemas';
import {
  Reclassify_TypeExhibitType,
  Reclassify_TypeMGFormType,
  Reclassify_TypeOtherType,
  Reclassify_TypeStatementType,
  Reclassify_WitnessAndActionPlanType,
} from '../../schemas/forms/reclassify';

export type FormStep = 'classification' | 'summary' | 'addWitness' | 'subject';

type Reclassify_Statement_With_ActionPlan = {
  witnessId: 0;
  witnessActionPlan: Reclassify_WitnessAndActionPlanType;
};

type Reclassify_Statement_Without_ActionPlan = { witnessId: number; witnessActionPlan?: undefined };

type Reclassify_Statement_Data = (
  | Reclassify_Statement_With_ActionPlan
  | Reclassify_Statement_Without_ActionPlan
) &
  Reclassify_TypeStatementType & { subject: string };

export type ReclassifyFormData =
  | Reclassify_Statement_Data
  | Reclassify_TypeExhibitType
  | Reclassify_TypeMGFormType
  | Reclassify_TypeOtherType;

export const useReclassifyForm = (material: CaseMaterialsType) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('classification');
  const [formData, setFormData] = useState<Partial<ReclassifyFormData>>({
    materialId: material?.materialId,
    subject: material?.subject,
    used: true,
  });

  const changeFormStep = (step: FormStep) => {
    setCurrentStep(step);
  };

  const saveFormData = (updatedFormData: Record<string, unknown>) => {
    setFormData((prevState) => ({ ...prevState, ...updatedFormData }));
  };

  return { changeFormStep, currentStep, formData, saveFormData };
};
