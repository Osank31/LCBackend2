import {Router} from 'express';
import {createPlan, deletePlan, getAllPlans, getPlanById, updatePlan} from "../controllers/plans.controller";

const router = Router();

router.get('/', getAllPlans);
router.get('/:id', getPlanById);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);


export default router;