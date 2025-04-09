from typing import Optional
from fastapi import HTTPException
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class PaymentManager:
    def __init__(self):
        self.stripe = stripe

    async def create_payment_intent(self, amount: int, currency: str = "usd") -> dict:
        try:
            payment_intent = self.stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                automatic_payment_methods={"enabled": True},
            )
            return {
                "client_secret": payment_intent.client_secret,
                "payment_intent_id": payment_intent.id
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def confirm_payment(self, payment_intent_id: str) -> bool:
        try:
            payment_intent = self.stripe.PaymentIntent.retrieve(payment_intent_id)
            if payment_intent.status == "succeeded":
                return True
            return False
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def create_refund(self, payment_intent_id: str, amount: Optional[int] = None) -> dict:
        try:
            refund = self.stripe.Refund.create(
                payment_intent=payment_intent_id,
                amount=amount
            )
            return {
                "refund_id": refund.id,
                "status": refund.status
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

payment_manager = PaymentManager() 