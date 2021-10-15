import React from 'react';

const SuperSimpleCardScanner = (props) => {
        return(
          <>
          <button onClick={() => props.onScan({
            cardName: 'test',
            cvcCode: '343',
            expiryDateMonth: '03',
            expiryDateYear: '2022',
            cardNumber: '4242424242424242',
          })}>Scan</button>
          </>
        )
}

export default SuperSimpleCardScanner;