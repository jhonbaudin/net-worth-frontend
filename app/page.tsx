'use client';
import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import styles from './NetWorthCalculator.module.css';
import loaderStyles from './Loader.module.css';

interface Item {
  id: string;
  description: string;
  amount: number;
  addedByClient?: boolean;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

const NetWorthCalculator: React.FC = () => {
  const [assets, setAssets] = useState<Item[]>([
    { id: uuid(), description: 'Chequing', amount: 0 },
    { id: uuid(), description: 'Savings for Taxes', amount: 0 },
    { id: uuid(), description: 'Rainy Day Fund', amount: 0 },
    { id: uuid(), description: 'Savings for Fun', amount: 0 },
    { id: uuid(), description: 'Savings for Travel', amount: 0 },
    { id: uuid(), description: 'Savings for Personal Development', amount: 0 },
    { id: uuid(), description: 'Investment 1', amount: 0 },
    { id: uuid(), description: 'Investment 2', amount: 0 },
    { id: uuid(), description: 'Investment 3', amount: 0 },
    { id: uuid(), description: 'Investment 4', amount: 0 },
    { id: uuid(), description: 'Investment 5', amount: 0 },
    { id: uuid(), description: 'Primary Home', amount: 0 },
    { id: uuid(), description: 'Second Home', amount: 0 },
    { id: uuid(), description: 'Other', amount: 0 },
  ]);

  const [liabilities, setLiabilities] = useState<Item[]>([
    { id: uuid(), description: 'Credit Card 1', amount: 0 },
    { id: uuid(), description: 'Credit Card 2', amount: 0 },
    { id: uuid(), description: 'Mortgage 1', amount: 0 },
    { id: uuid(), description: 'Mortgage 2', amount: 0 },
    { id: uuid(), description: 'Line of Credit', amount: 0 },
    { id: uuid(), description: 'Investment Loan', amount: 0 },
  ]);

  const currencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
  ];

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [totalLiabilities, setTotalLiabilities] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);
  const [totalSummary, setTotalSummary] = useState<number>(0);
  const [totalConversion, setTotalConversion] = useState<number>(0);


  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3100/calculate-net-worth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currency: selectedCurrency.code,
        assets: assets,
        liabilities: liabilities
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTotalAssets(data.assets);
        setTotalLiabilities(data.liabilities);
        setTotalSummary(data.netWorth)
        setTotalConversion(data.conversion)
      })
      .catch((error) => {
        console.error('Error:', error);
      })

  }, [assets, liabilities, selectedCurrency]);

  const handleAddItem = (type: 'asset' | 'liability') => {
    const newItem: Item = { id: uuid(), description: '', amount: 0, addedByClient: true };
    if ('asset' === type) {
      setAssets([...assets, newItem]);
    } else {
      setLiabilities([...liabilities, newItem]);
    }
  };

  const handleDeleteItem = (id: string, type: 'asset' | 'liability') => {
    if (('asset' === type && assets.length > 1) || ('liability' === type && liabilities.length > 1)) {
      if ('asset' === type) {
        setAssets(assets.filter((asset) => asset.id !== id));
      } else {
        setLiabilities(liabilities.filter((liability) => liability.id !== id));
      }
    }
  };

  let inputChangeTimeout: NodeJS.Timeout;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id: string, type: 'asset' | 'liability') => {
    const { name, value } = e.target;
    clearTimeout(inputChangeTimeout);
    inputChangeTimeout = setTimeout(() => {
      if ('asset' === type) {
        setAssets((prevAssets) =>
          prevAssets.map((prevAsset) => (prevAsset.id === id ? { ...prevAsset, [name]: value } : prevAsset))
        );
      } else {
        setLiabilities((prevLiabilities) =>
          prevLiabilities.map((prevLiability) => (prevLiability.id === id ? { ...prevLiability, [name]: value } : prevLiability))
        );
      }
    }, 500);
  };

  const handleClearData = () => {
    const cleanData = (items: Item[]) => [...items].filter((item) => !item.addedByClient).map((item) => ({ ...item, 'amount': 0 }));
    setAssets(cleanData(assets));
    setLiabilities(cleanData(liabilities));
  };

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const currencyCode = event.target.value;
    const selectedCurrencyObject = currencies.find((currency) => currency.code === currencyCode);
    setSelectedCurrency(selectedCurrencyObject ?? currencies[0]);
  };

  return (
    <div>
      {isLoading ? (
        <div className={loaderStyles.loader_overlay}>
          <div className={loaderStyles.loader}></div>
        </div>
      ) : (
        <div className={styles.container}>
          <h1 className={styles.heading}>Net Worth Calculator</h1>
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Summary</h2>
            <div className={styles.summaryContainer}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Total Assets</div>
                <div className={styles.green}>{selectedCurrency.symbol} {totalAssets}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Total Liabilities</div>
                <div className={styles.red}>{selectedCurrency.symbol} {totalLiabilities}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Net Worth</div>
                <div className={`${styles.totalNetWorth} ${totalSummary >= 0 ? styles.green : styles.red}`}>{selectedCurrency.symbol} {totalSummary}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Net Worth on USD</div>
                <div className={`${styles.totalNetWorthUSD} ${totalConversion >= 0 ? styles.green : styles.red}`}>$ {totalConversion}</div>
              </div>
            </div>
          </div>

          <div className={styles.currency}>
            <h2 className={styles.summaryTitle}>Select Currency</h2>
            <div className={styles.selectContainer}>
              <select className={styles.select} value={selectedCurrency.code || 'USD'} onChange={handleCurrencyChange}>
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name}
                  </option>
                ))}
              </select>
              <span className={styles.selectArrow}></span>
            </div>
          </div>

          <div className={styles.netWorthCalculator}>
            <div className={styles.table}>
              <h2 className={styles.tableTitle}>Assets</h2>
              <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableCell}>Description</div>
                  <div className={styles.tableCell}>Amount</div>
                  <div className={styles.tableCell}></div>
                </div>
                {assets.map((asset) => (
                  <div className={styles.tableRow} key={asset.id}>
                    <input
                      type="text"
                      className={styles.tableInput}
                      name="description"
                      readOnly={!asset.addedByClient}
                      defaultValue={asset.description}
                    />
                    <span className={styles.inputSymbol}>{selectedCurrency.symbol}</span>
                    <input
                      type="number"
                      className={styles.tableInput}
                      name="amount"
                      defaultValue={asset.amount}
                      onChange={(e) => handleInputChange(e, asset.id, 'asset')}
                    />
                    {(assets.length > 1) && asset.addedByClient && (
                      <button className={styles.deleteButton} onClick={() => handleDeleteItem(asset.id, 'asset')}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button className={styles.addButton} onClick={() => handleAddItem('asset')}>
                <FontAwesomeIcon icon={faPlus} /> Add Asset
              </button>
            </div>

            <div className={styles.table}>
              <h2 className={styles.tableTitle}>Liabilities</h2>
              <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableCell}>Description</div>
                  <div className={styles.tableCell}>Amount</div>
                  <div className={styles.tableCell}></div>
                </div>
                {liabilities.map((liability) => (
                  <div className={styles.tableRow} key={liability.id}>
                    <input
                      type="text"
                      className={styles.tableInput}
                      name="description"
                      defaultValue={liability.description}
                    />
                    <span className={styles.inputSymbol}>{selectedCurrency.symbol}</span>
                    <input
                      type="number"
                      className={styles.tableInput}
                      name="amount"
                      defaultValue={liability.amount}
                      onChange={(e) => handleInputChange(e, liability.id, 'liability')}
                    />
                    {(liabilities.length > 1) && liability.addedByClient && (
                      <button className={styles.deleteButton} onClick={() => handleDeleteItem(liability.id, 'liability')}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button className={styles.addButton} onClick={() => handleAddItem('liability')}>
                <FontAwesomeIcon icon={faPlus} /> Add Liability
              </button>
            </div>
          </div>
          <button className={styles.clearButton} onClick={handleClearData}>
            Clear Data
          </button>
        </div>
      )}
    </div>
  );
};

export default NetWorthCalculator;
