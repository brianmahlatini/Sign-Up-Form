import React, { useState } from 'react';
import './App.css';

function App() {
  // Policy Selection State
  const [policySelection, setPolicySelection] = useState({
    selectedProduct: '', // 'essential' or 'xmas'
    coverageOption: '' // Will store the selected option with amount
  });

  // Main Member State
  const [mainMember, setMainMember] = useState({
    firstName: '',
    surname: '',
    policyNumber: '',
    idNumber: '',
    cellphone: '',
    email: ''
  });

  // Repeatable Sections State
  const [spouses, setSpouses] = useState([]);
  const [dependants, setDependants] = useState([]);
  const [extendedFamily, setExtendedFamily] = useState([]);

  // Bank Details State
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountType: ''
  });
  
  // Beneficiary State
  const [beneficiary, setBeneficiary] = useState({
    firstName: '',
    surname: '',
    idNumber: '',
    relationship: '',
    email: ''
  });

  // Documents State
  const [document, setDocument] = useState(null);
  const [documentName, setDocumentName] = useState('');

  // Declaration State
  const [declaration, setDeclaration] = useState({
    confirmed: false,
    signature: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Form Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Bank List
  const bankList = [
    'ABN AMRO BANK',
    'ABSA',
    'ALBARAKA BANK',
    'BANK OF ATHENS',
    'CAPITEC BANK',
    'CITIBANK',
    'FNB',
    'INVESTEC',
    'NBS',
    'NEDBANK CHQ ACCOUNT',
    'NEDBANK SAVINGS ACCOUNT',
    'PEP BANK',
    'STANDARD BANK',
    'STATE BANK OF INDIA',
    'TYMEBANK',
    'BANK ZERO',
    'BNP PARIBAS SA',
    'DISCOVERY BANK LTD',
    'FINBOND MUTUAL BANK',
    'HSBC BANK',
    'J.P.MORGAN CHASE BANK',
    'SASFIN BANK LIMITED',
    'SOCIETE GENERALE BANK'
  ];

  // Account Types
  const accountTypes = ['Savings', 'Cheque', 'Current'];

  // API Endpoint
  const WEBHOOK_URL = '/api/webhook';

  // Helper function to determine policy type from coverage option
  const getPolicyTypeFromCoverage = () => {
    if (!policySelection.coverageOption) return null;
    
    const option = policySelection.coverageOption;
    if (option.includes('FAMILY')) return 'family';
    if (option.includes('INDIVIDUAL')) return 'individual';
    if (option.includes('SINGLE PARENT')) return 'single';
    return null;
  };

  // Get coverage options based on selected product
  const getCoverageOptions = () => {
    if (policySelection.selectedProduct === 'essential') {
      return [
        { value: 'ESSENTIAL FAMILY 10000', label: 'ESSENTIAL FAMILY 10000' },
        { value: 'ESSENTIAL FAMILY 15000', label: 'ESSENTIAL FAMILY 15000' },
        { value: 'ESSENTIAL FAMILY 20000', label: 'ESSENTIAL FAMILY 20000' },
        { value: 'ESSENTIAL FAMILY 25000', label: 'ESSENTIAL FAMILY 25000' },
        { value: 'ESSENTIAL FAMILY 30000', label: 'ESSENTIAL FAMILY 30000' },
        { value: 'ESSENTIAL INDIVIDUAL 10000', label: 'ESSENTIAL INDIVIDUAL 10000' },
        { value: 'ESSENTIAL INDIVIDUAL 15000', label: 'ESSENTIAL INDIVIDUAL 15000' },
        { value: 'ESSENTIAL INDIVIDUAL 20000', label: 'ESSENTIAL INDIVIDUAL 20000' },
        { value: 'ESSENTIAL INDIVIDUAL 25000', label: 'ESSENTIAL INDIVIDUAL 25000' },
        { value: 'ESSENTIAL INDIVIDUAL 30000', label: 'ESSENTIAL INDIVIDUAL 30000' },
        { value: 'ESSENTIAL SINGLE PARENT 10000', label: 'ESSENTIAL SINGLE PARENT 10000' },
        { value: 'ESSENTIAL SINGLE PARENT 15000', label: 'ESSENTIAL SINGLE PARENT 15000' },
        { value: 'ESSENTIAL SINGLE PARENT 20000', label: 'ESSENTIAL SINGLE PARENT 20000' },
        { value: 'ESSENTIAL SINGLE PARENT 25000', label: 'ESSENTIAL SINGLE PARENT 25000' },
        { value: 'ESSENTIAL SINGLE PARENT 30000', label: 'ESSENTIAL SINGLE PARENT 30000' }
      ];
    } else if (policySelection.selectedProduct === 'xmas') {
      return [
        { value: 'XMAS BOX 10000', label: 'XMAS BOX 10000' },
        { value: 'XMAS BOX 15000', label: 'XMAS BOX 15000' },
        { value: 'XMAS BOX 20000', label: 'XMAS BOX 20000' },
        { value: 'XMAS BOX 25000', label: 'XMAS BOX 25000' }
      ];
    }
    return [];
  };

  // Handle policy selection changes
  const handlePolicyChange = (e) => {
    const { name, value } = e.target;
    setPolicySelection(prev => ({
      ...prev,
      [name]: value,
      // Reset coverage option when product changes
      ...(name === 'selectedProduct' && { coverageOption: '' })
    }));
    
    // Clear sections when policy type changes
    if (name === 'coverageOption' && policySelection.selectedProduct === 'essential') {
      // Clear spouses and dependants if not allowed for this policy type
      const policyType = value.includes('FAMILY') ? 'family' : 
                         value.includes('INDIVIDUAL') ? 'individual' : 
                         value.includes('SINGLE PARENT') ? 'single' : null;
      
      if (policyType === 'individual') {
        // Individual: clear spouses and dependants
        setSpouses([]);
        setDependants([]);
      } else if (policyType === 'single') {
        // Single Parent: clear spouses only
        setSpouses([]);
      }
      // Family: keep all sections
    }
  };

  // Check if spouses can be added
  const canAddSpouse = () => {
    // For XMAS BOX, spouses can be added
    if (policySelection.selectedProduct === 'xmas') return true;
    
    // For Essential, only FAMILY policies can add spouses
    const policyType = getPolicyTypeFromCoverage();
    return policyType === 'family';
  };

  // Check if dependants can be added
  const canAddDependant = () => {
    // For XMAS BOX, dependants can be added
    if (policySelection.selectedProduct === 'xmas') return true;
    
    // For Essential, FAMILY and SINGLE PARENT policies can add dependants
    const policyType = getPolicyTypeFromCoverage();
    return policyType === 'family' || policyType === 'single';
  };

  // Check if extended family can be added
  const canAddExtendedFamily = () => {
    // For XMAS BOX, extended family CANNOT be added
    if (policySelection.selectedProduct === 'xmas') return false;
    
    // For Essential, FAMILY, INDIVIDUAL, and SINGLE PARENT can all add extended family
    const policyType = getPolicyTypeFromCoverage();
    return policyType === 'family' || policyType === 'individual' || policyType === 'single';
  };

  // Add functions for repeatable sections with permission checks
  const addSpouse = () => {
    if (canAddSpouse()) {
      setSpouses([...spouses, { name: '', surname: '', idNumber: '' }]);
    }
  };

  const addDependant = () => {
    if (canAddDependant()) {
      setDependants([...dependants, { name: '', surname: '', idNumber: '' }]);
    }
  };

  const addExtendedFamily = () => {
    if (canAddExtendedFamily()) {
      setExtendedFamily([...extendedFamily, { name: '', surname: '', idNumber: '' }]);
    }
  };

  // Remove functions for repeatable sections
  const removeSpouse = (index) => {
    setSpouses(spouses.filter((_, i) => i !== index));
  };

  const removeDependant = (index) => {
    setDependants(dependants.filter((_, i) => i !== index));
  };

  const removeExtendedFamily = (index) => {
    setExtendedFamily(extendedFamily.filter((_, i) => i !== index));
  };

  // Update functions for repeatable sections
  const updateSpouse = (index, field, value) => {
    const updatedSpouses = [...spouses];
    updatedSpouses[index][field] = value;
    setSpouses(updatedSpouses);
  };

  const updateDependant = (index, field, value) => {
    const updatedDependants = [...dependants];
    updatedDependants[index][field] = value;
    setDependants(updatedDependants);
  };

  const updateExtendedFamily = (index, field, value) => {
    const updatedExtendedFamily = [...extendedFamily];
    updatedExtendedFamily[index][field] = value;
    setExtendedFamily(updatedExtendedFamily);
  };

  // Handle file upload
  const handleFileChange = (e) => {
    if (e && e.target && e.target.files) {
      const file = e.target.files[0];
      setDocument(file);
      setDocumentName(file ? file.name : '');
    }
  };

  // Handle main member changes
  const handleMainMemberChange = (e) => {
    setMainMember({
      ...mainMember,
      [e.target.name]: e.target.value
    });
  };

  // Handle bank details changes
  const handleBankDetailsChange = (e) => {
    setBankDetails({
      ...bankDetails,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle beneficiary changes
  const handleBeneficiaryChange = (e) => {
    setBeneficiary({
      ...beneficiary,
      [e.target.name]: e.target.value
    });
  };

  // Handle declaration changes
  const handleDeclarationChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setDeclaration({
      ...declaration,
      [e.target.name]: value
    });
  };

  // Validate form
  const validateForm = () => {
    // Check main member required fields
    for (let key in mainMember) {
      if (!mainMember[key]) {
        setSubmitStatus({
          type: 'error',
          message: `Please fill in ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        });
        return false;
      }
    }

    // Check policy selection
    if (!policySelection.selectedProduct) {
      setSubmitStatus({
        type: 'error',
        message: 'Please select a policy product'
      });
      return false;
    }

    if (!policySelection.coverageOption) {
      setSubmitStatus({
        type: 'error',
        message: 'Please select a coverage option'
      });
      return false;
    }

    // Check bank details required fields
    if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountType) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all bank details'
      });
      return false;
    }
    
    // Check beneficiary required fields
    if (!beneficiary.firstName || !beneficiary.surname || !beneficiary.idNumber || !beneficiary.relationship || !beneficiary.email) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all beneficiary details'
      });
      return false;
    }

    // Check document
    if (!document) {
      setSubmitStatus({
        type: 'error',
        message: 'Please upload a document'
      });
      return false;
    }

    // Check declaration
    if (!declaration.confirmed || !declaration.signature) {
      setSubmitStatus({
        type: 'error',
        message: 'Please complete the declaration section'
      });
      return false;
    }

    return true;
  };

  // Prepare JSON data
  const prepareJSONData = () => {
    // Filter out empty entries from repeatable sections
    const filteredSpouses = spouses.filter(s => s.name || s.surname || s.idNumber);
    const filteredDependants = dependants.filter(d => d.name || d.surname || d.idNumber);
    const filteredExtendedFamily = extendedFamily.filter(e => e.name || e.surname || e.idNumber);

    // Create a reader to convert file to base64
    return new Promise((resolve, reject) => {
      if (!document) {
        reject(new Error('No document selected'));
        return;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(document);
      reader.onload = () => {
        const jsonData = {
          company: "KGA Life Insurance Company",
          policySelection,
          mainMember,
          spouses: filteredSpouses,
          dependants: filteredDependants,
          extendedFamily: filteredExtendedFamily,
          bankDetails,
          beneficiary,
          document: {
            name: document.name,
            type: document.type,
            size: document.size,
            content: reader.result
          },
          declaration,
          submissionDate: new Date().toISOString(),
          submissionId: 'KGA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };
        resolve(jsonData);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Reset form function
  const resetForm = () => {
    setPolicySelection({
      selectedProduct: '',
      coverageOption: ''
    });
    
    setMainMember({
      firstName: '',
      surname: '',
      policyNumber: '',
      idNumber: '',
      cellphone: '',
      email: ''
    });
    setSpouses([]);
    setDependants([]);
    setExtendedFamily([]);
    setBankDetails({
      bankName: '',
      accountNumber: '',
      accountType: ''
    });
    setBeneficiary({
      firstName: '',
      surname: '',
      idNumber: '',
      relationship: '',
      email: ''
    });
    setDocument(null);
    setDocumentName('');
    setDeclaration({
      confirmed: false,
      signature: '',
      date: new Date().toISOString().split('T')[0]
    });

    // Safely reset file input
    try {
      const fileInput = document.getElementById('document-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.log('File input reset skipped:', error.message);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: 'info', message: 'Submitting form...' });

    try {
      const jsonData = await prepareJSONData();
      
      console.log('Submitting data:', jsonData);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status: ${response.status} - ${errorText}`);
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = { status: 'success' };
      }

      console.log('Success:', responseData);

      setSubmitStatus({
        type: 'success',
        message: '✅ Form submitted successfully!'
      });

      resetForm();

    } catch (error) {
      console.error('Submission error:', error.message);

      setSubmitStatus({
        type: 'error',
        message: `Error: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const coverageOptions = getCoverageOptions();
  const policyType = getPolicyTypeFromCoverage();

  return (
    <div className="app">
      <div className="form-container">
        <h1>Policy Enrollment Form</h1>
        
        {submitStatus && (
          <div className={`status-message ${submitStatus.type}`}>
            {typeof submitStatus.message === 'string' ? submitStatus.message : submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Main Member */}
          <section className="form-section">
            <h2>Main Member Information <span className="required-badge">Required</span></h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={mainMember.firstName}
                  onChange={handleMainMemberChange}
                  required
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label>Surname *</label>
                <input
                  type="text"
                  name="surname"
                  value={mainMember.surname}
                  onChange={handleMainMemberChange}
                  required
                  placeholder="Enter surname"
                />
              </div>
              <div className="form-group">
                <label>ID Number *</label>
                <input
                  type="text"
                  name="idNumber"
                  value={mainMember.idNumber}
                  onChange={handleMainMemberChange}
                  required
                  placeholder="Enter ID number"
                />
              </div>
              <div className="form-group">
                <label>Policy Number *</label>
                <input
                  type="text"
                  name="policyNumber"
                  value={mainMember.policyNumber}
                  onChange={handleMainMemberChange}
                  required
                  placeholder="Enter policy number"
                />
              </div>
              <div className="form-group">
                <label>Cellphone *</label>
                <input
                  type="tel"
                  name="cellphone"
                  value={mainMember.cellphone}
                  onChange={handleMainMemberChange}
                  required
                  placeholder="Enter cellphone number"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={mainMember.email}
                  onChange={handleMainMemberChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Policy Description */}
          <section className="form-section policy-section">
            <h2>Policy Description <span className="required-badge">Required</span></h2>
            
            <div className="policy-products">
              {/* Essential Family Product */}
              <div 
                className={`policy-card ${policySelection.selectedProduct === 'essential' ? 'selected' : ''}`}
                onClick={() => setPolicySelection(prev => ({ ...prev, selectedProduct: 'essential', coverageOption: '' }))}
              >
                <div className="policy-card-header">
                  <h3>ESSENTIAL FAMILY</h3>
                </div>
                <p className="policy-description">Comprehensive coverage for your family's essential needs</p>
                {policySelection.selectedProduct === 'essential' && (
                  <div className="selected-badge">Selected ✓</div>
                )}
              </div>

              {/* XMAS Box Product */}
              <div 
                className={`policy-card ${policySelection.selectedProduct === 'xmas' ? 'selected' : ''}`}
                onClick={() => setPolicySelection(prev => ({ ...prev, selectedProduct: 'xmas', coverageOption: '' }))}
              >
                <div className="policy-card-header">
                  <h3>XMAS BOX</h3>
                </div>
                <p className="policy-description">Special holiday coverage with festive benefits</p>
                {policySelection.selectedProduct === 'xmas' && (
                  <div className="selected-badge">Selected ✓</div>
                )}
              </div>
            </div>

            {/* Coverage Options Selection */}
            {policySelection.selectedProduct && coverageOptions.length > 0 && (
              <div className="coverage-type-section">
                <h3>Select Coverage Amount</h3>
                <div className="coverage-options-grid">
                  {coverageOptions.map(option => (
                    <label key={option.value} className="coverage-option-card">
                      <input
                        type="radio"
                        name="coverageOption"
                        value={option.value}
                        checked={policySelection.coverageOption === option.value}
                        onChange={handlePolicyChange}
                        required
                      />
                      <span className="coverage-option-label">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Policy Summary */}
            {policySelection.selectedProduct && policySelection.coverageOption && (
              <div className="policy-summary">
                <div className="summary-badge">
                  {policySelection.coverageOption}
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Spouses - For FAMILY policy (Essential) or any XMAS BOX */}
          {(policyType === 'family' || policySelection.selectedProduct === 'xmas') && (
            <section className="form-section">
              <div className="section-header">
                <h2>Spouses</h2>
                <button type="button" onClick={addSpouse} className="add-button">
                  ➕ Add Another Spouse
                </button>
              </div>
              {spouses.length === 0 ? (
                <p className="empty-section">No spouses added. Click the button above to add.</p>
              ) : (
                spouses.map((spouse, index) => (
                  <div key={index} className="repeatable-item">
                    <div className="repeatable-header">
                      <h3>Spouse #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeSpouse(index)}
                        className="remove-button"
                        title="Remove spouse"
                      >
                        ✖
                      </button>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Spouse Name</label>
                        <input
                          type="text"
                          value={spouse.name}
                          onChange={(e) => updateSpouse(index, 'name', e.target.value)}
                          placeholder="Enter spouse name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Spouse Surname</label>
                        <input
                          type="text"
                          value={spouse.surname}
                          onChange={(e) => updateSpouse(index, 'surname', e.target.value)}
                          placeholder="Enter spouse surname"
                        />
                      </div>
                      <div className="form-group">
                        <label>Spouse ID Number</label>
                        <input
                          type="text"
                          value={spouse.idNumber}
                          onChange={(e) => updateSpouse(index, 'idNumber', e.target.value)}
                          placeholder="Enter spouse ID number"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}

          {/* Section 4: Dependants - For FAMILY/SINGLE (Essential) or any XMAS BOX */}
          {(policyType === 'family' || policyType === 'single' || policySelection.selectedProduct === 'xmas') && (
            <section className="form-section">
              <div className="section-header">
                <h2>Dependants</h2>
                <button type="button" onClick={addDependant} className="add-button">
                  ➕ Add Another Dependant
                </button>
              </div>
              {dependants.length === 0 ? (
                <p className="empty-section">No dependants added. Click the button above to add.</p>
              ) : (
                dependants.map((dependant, index) => (
                  <div key={index} className="repeatable-item">
                    <div className="repeatable-header">
                      <h3>Dependant #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeDependant(index)}
                        className="remove-button"
                        title="Remove dependant"
                      >
                        ✖
                      </button>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Dependant Name</label>
                        <input
                          type="text"
                          value={dependant.name}
                          onChange={(e) => updateDependant(index, 'name', e.target.value)}
                          placeholder="Enter dependant name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Dependant Surname</label>
                        <input
                          type="text"
                          value={dependant.surname}
                          onChange={(e) => updateDependant(index, 'surname', e.target.value)}
                          placeholder="Enter dependant surname"
                        />
                      </div>
                      <div className="form-group">
                        <label>Dependant ID Number</label>
                        <input
                          type="text"
                          value={dependant.idNumber}
                          onChange={(e) => updateDependant(index, 'idNumber', e.target.value)}
                          placeholder="Enter dependant ID number"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}

          {/* Section 5: Extended Family - For Essential policies only (FAMILY, INDIVIDUAL, SINGLE) */}
          {policySelection.selectedProduct === 'essential' && policyType && (
            <section className="form-section">
              <div className="section-header">
                <h2>Extended Family</h2>
                <button type="button" onClick={addExtendedFamily} className="add-button">
                  ➕ Add Another Family Member
                </button>
              </div>
              {extendedFamily.length === 0 ? (
                <p className="empty-section">No extended family members added. Click the button above to add.</p>
              ) : (
                extendedFamily.map((member, index) => (
                  <div key={index} className="repeatable-item">
                    <div className="repeatable-header">
                      <h3>Family Member #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeExtendedFamily(index)}
                        className="remove-button"
                        title="Remove family member"
                      >
                        ✖
                      </button>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Extended Family Name</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateExtendedFamily(index, 'name', e.target.value)}
                          placeholder="Enter family member name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Extended Family Surname</label>
                        <input
                          type="text"
                          value={member.surname}
                          onChange={(e) => updateExtendedFamily(index, 'surname', e.target.value)}
                          placeholder="Enter family member surname"
                        />
                      </div>
                      <div className="form-group">
                        <label>Extended Family ID Number</label>
                        <input
                          type="text"
                          value={member.idNumber}
                          onChange={(e) => updateExtendedFamily(index, 'idNumber', e.target.value)}
                          placeholder="Enter family member ID number"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}

          {/* Section 6: Bank Details */}
          <section className="form-section">
            <h2>Bank Details <span className="required-badge">Required</span></h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Bank Name *</label>
                <select
                  name="bankName"
                  value={bankDetails.bankName}
                  onChange={handleBankDetailsChange}
                  required
                >
                  <option value="">Select a bank</option>
                  {bankList.map((bank, index) => (
                    <option key={index} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={handleBankDetailsChange}
                  required
                  placeholder="Enter account number"
                />
              </div>
              <div className="form-group">
                <label>Account Type *</label>
                <select
                  name="accountType"
                  value={bankDetails.accountType}
                  onChange={handleBankDetailsChange}
                  required
                >
                  <option value="">Select account type</option>
                  {accountTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
          
          {/* Section 7: Beneficiary */}
          <section className="form-section">
            <h2>Beneficiary <span className="required-badge">Required</span></h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={beneficiary.firstName}
                  onChange={handleBeneficiaryChange}
                  required
                  placeholder="Enter beneficiary first name"
                />
              </div>
              <div className="form-group">
                <label>Surname *</label>
                <input
                  type="text"
                  name="surname"
                  value={beneficiary.surname}
                  onChange={handleBeneficiaryChange}
                  required
                  placeholder="Enter beneficiary surname"
                />
              </div>
              <div className="form-group">
                <label>ID Number *</label>
                <input
                  type="text"
                  name="idNumber"
                  value={beneficiary.idNumber}
                  onChange={handleBeneficiaryChange}
                  required
                  placeholder="Enter beneficiary ID number"
                />
              </div>
              <div className="form-group">
                <label>Relationship *</label>
                <input
                  type="text"
                  name="relationship"
                  value={beneficiary.relationship}
                  onChange={handleBeneficiaryChange}
                  required
                  placeholder="Enter relationship"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={beneficiary.email}
                  onChange={handleBeneficiaryChange}
                  required
                  placeholder="Enter beneficiary email"
                />
              </div>
            </div>
          </section>

          {/* Section 8: Documents */}
          <section className="form-section">
            <h2>Documents <span className="required-badge">Required</span></h2>
            <div className="form-group file-upload">
              <label>Upload Document (PDF, JPG, PNG) *</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="document-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                <div className="file-info">
                  {documentName ? (
                    <span className="file-name">Selected: {documentName}</span>
                  ) : (
                    <span className="file-placeholder">Choose a file...</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 9: Declaration */}
          <section className="form-section">
            <h2>Declaration <span className="required-badge">Required</span></h2>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="confirmed"
                  checked={declaration.confirmed}
                  onChange={handleDeclarationChange}
                  required
                />
                <span>I confirm that all information provided is true and correct *</span>
              </label>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Electronic Signature (Full Name) *</label>
                <input
                  type="text"
                  name="signature"
                  value={declaration.signature}
                  onChange={handleDeclarationChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={declaration.date}
                  onChange={handleDeclarationChange}
                  required
                />
                <small className="date-hint">Click the calendar icon to select a date</small>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Policy Signup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
