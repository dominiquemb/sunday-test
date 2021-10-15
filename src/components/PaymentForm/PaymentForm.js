import React, { useState } from 'react';
import SuperSimpleCardScanner from '../SuperSimpleCardScanner/SuperSimpleCardScanner';
import { FormControl, InputLabel, Input, FormHelperText } from '@mui/material';
import './PaymentForm.css';
import { getThemeProps } from '@mui/system';

const PaymentForm = (props) => {
    const [email, setEmail] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvcCode, setCvcCode] = useState('');
    const [cardName, setCardName] = useState('');

    const onCreditCardScan = (result) => {
        setCardName(result.cardName);
        setCardNumber(result.cardNumber);
        setExpiryDate(result.expiryDateMonth + '/' + result.expiryDateYear);
        setCvcCode(result.cvcCode);
    }

    const onSubmitForm = () => {
        if (props.onSubmit) {
            props.onSubmit({
                email: email,
                cardNumber: cardNumber,
                expiryDate: expiryDate,
                cvcCode: cvcCode,
                cardName: cardName
            });
        }
    }

    return(
        <div className="payment-form">
        <FormControl>
            <InputLabel htmlFor="email">Email address</InputLabel>
            <Input id="email" />
            <SuperSimpleCardScanner apiKey="whatever" onScan={onCreditCardScan} />
            <button onClick={() => onSubmitForm()}>Submit</button>
        </FormControl>
        </div>
    )
}

export default PaymentForm;