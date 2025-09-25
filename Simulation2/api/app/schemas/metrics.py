from pydantic import BaseModel


class ValidationMetrics(BaseModel):
    valuation_accuracy: float
    demographic_parity: float
    athlete_earnings_lift: float
    compliance_cost_reduction: float
