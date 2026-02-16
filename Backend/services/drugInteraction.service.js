const axios = require('axios');

// Check for drug interactions using FDA API
const checkDrugInteractions = async (medications) => {
  try {
    if (!medications || medications.length < 2) {
      return { hasInteractions: false, interactions: [] };
    }

    // FDA OpenFDA Drug API endpoint
    const interactions = [];
    
    // Check each pair of medications
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1 = medications[i].medicationName.toLowerCase();
        const drug2 = medications[j].medicationName.toLowerCase();
        
        try {
          // Query FDA API for drug interactions
          const response = await axios.get(
            `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drug1}"+AND+drug_interactions:"${drug2}"&limit=1`
          );
          
          if (response.data.results && response.data.results.length > 0) {
            const result = response.data.results[0];
            
            interactions.push({
              drug1: medications[i].medicationName,
              drug2: medications[j].medicationName,
              severity: 'moderate', // FDA API doesn't provide severity
              description: result.drug_interactions ? result.drug_interactions[0] : 'Potential interaction detected',
              source: 'FDA OpenFDA'
            });
          }
        } catch (error) {
          // If no interaction found or API error, continue
          console.log(`No interaction data found for ${drug1} and ${drug2}`);
        }
      }
    }
    
    return {
      hasInteractions: interactions.length > 0,
      interactions: interactions
    };
  } catch (error) {
    console.error('Error checking drug interactions:', error);
    return { hasInteractions: false, interactions: [], error: error.message };
  }
};

// Simple local database of common interactions (fallback)
const commonInteractions = {
  'aspirin': ['warfarin', 'ibuprofen', 'naproxen'],
  'warfarin': ['aspirin', 'ibuprofen', 'vitamin k'],
  'metformin': ['alcohol', 'insulin'],
  'lisinopril': ['potassium', 'spironolactone'],
  'simvastatin': ['grapefruit', 'clarithromycin']
};

// Check using local database
const checkLocalInteractions = (medications) => {
  const interactions = [];
  
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const drug1 = medications[i].medicationName.toLowerCase();
      const drug2 = medications[j].medicationName.toLowerCase();
      
      if (commonInteractions[drug1]?.includes(drug2) || 
          commonInteractions[drug2]?.includes(drug1)) {
        interactions.push({
          drug1: medications[i].medicationName,
          drug2: medications[j].medicationName,
          severity: 'warning',
          description: 'These medications may interact. Consult your doctor.',
          source: 'Local Database'
        });
      }
    }
  }
  
  return {
    hasInteractions: interactions.length > 0,
    interactions: interactions
  };
};

module.exports = {
  checkDrugInteractions,
  checkLocalInteractions
};