import React, {  useState } from "react";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios"
import { useMutation } from "@apollo/client";
import { MAKE_DONATION } from "../utils/mutations";

const styles = {
  form:{
    display: 'flex',
    flexDirection: 'column',
    width: "100%",
    border: "1px solid black",
    padding: '1%',
    borderRadius: "1%"
  }
}


const CARD_OPTIONS = {
	iconStyle: "solid",
	style: {
		base: {
			iconColor: "#c4f0ff",
			color: "black",
			fontWeight: 500,
			fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
			fontSize: "16px",
			fontSmoothing: "antialiased",
			":-webkit-autofill": { color: "#fce883" },
			"::placeholder": { color: "#87bbfd" }
		},
		invalid: {
			iconColor: "red",
			color: "red"
		}
	}
}

export default function PaymentForm(props) {
  //console.log(props,"----------HERE---------------")
  const [makeDonation] = useMutation(MAKE_DONATION);
const [success, setSuccess] = useState(false)
const stripe = useStripe()
const elements = useElements()
// email state and handleing
const [email, setEmail] = useState("")
const handleEmailChange = (event) => {
  setEmail(event.target.value);
};
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Handling form submission...");

  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: "card",
    card: elements.getElement(CardElement),
  });

  console.log("Stripe payment method created:", paymentMethod);

  if (!error) {
    try {
      const { id } = paymentMethod;
      console.log("Stripe payment method ID:", id);
      console.log("email", email)
   

      const response = await axios.post("http://localhost:4000/payment", {
        amount: props.amount,
        description: props.description,
        email: email,
        id: id,
      });

      console.log("Payment API response:", response.data);

      if (response.data.success) {
        console.log("Successful payment");
        try {
          
        } catch (error) {
          
        }
        const mutationResponse = await makeDonation({
          variables: {
            organization: props.OrgID,
            amount: props.amount,
          },
        });

        console.log("Mutation response:", mutationResponse);

        setSuccess(true);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  } else {
    console.error("Stripe error:", error);
    console.log("Stripe error message:", error.message);
  }
};


  return (
<>
{!success ?
<form onSubmit={handleSubmit} style={styles.form}>
<fieldset className="FormGroup">
  <div className="FormRow">
    <CardElement options={CARD_OPTIONS}/>
    
  </div>
</fieldset>
<input
        type="email"
        title="email"
        placeholder="Enter your email"
        required="true"
        value={email}
        onChange={handleEmailChange}
      />
<button className="button2">Pay</button>
</form>
:
<div>
  <h2>You Just Donated {(props.amount /100).toFixed(2) }$ to {props.itemName} thank you so much!</h2>
</div>
}
</>
  );
  
}