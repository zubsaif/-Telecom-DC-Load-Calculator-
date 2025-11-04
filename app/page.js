import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Save } from 'lucide-react';

const DCLoadAdder = () => {
  const [equipment, setEquipment] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [diversityFactor, setDiversityFactor] = useState(80);
  const [siteName, setSiteName] = useState('');
  const [calculations, setCalculations] = useState([]);

  // Equipment database
  const equipmentDatabase = {
    'Radio Units': {
      'Ericsson 4449 B2': { power: 250, type: 'LTE' },
      'Ericsson 4402 B66': { power: 200, type: 'LTE' },
      'Nokia FSMF': { power: 300, type: '5G' },
      'Nokia FRGY': { power: 275, type: '5G' },
      'Huawei AAU5613': { power: 280, type: '5G' },
      'Samsung RU-MT6101': { power: 240, type: 'LTE' },
    },
    'BBU/Controller': {
      'Ericsson DUS 41': { power: 450, type: 'Controller' },
      'Nokia AirScale': { power: 500, type: 'Controller' },
      'Huawei BBU5900': { power: 480, type: 'Controller' },
      'ZTE ZXSDR BS8200': { power: 420, type: 'Controller' },
    },
    'Auxiliary Equipment': {
      'DC-DC Converter': { power: 50, type: 'Power' },
      'GPS Unit': { power: 15, type: 'Timing' },
      'Microwave ODU': { power: 80, type: 'Backhaul' },
      'Small Cell': { power: 30, type: 'Capacity' },
      'Alarm Panel': { power: 10, type: 'Monitoring' },
    }
  };

  const addEquipment = () => {
    if (!selectedModel) return;
    
    const category = Object.keys(equipmentDatabase).find(cat => 
      equipmentDatabase[cat][selectedModel]
    );
    
    const item = equipmentDatabase[category][selectedModel];
    
    setEquipment([...equipment, {
      id: Date.now(),
      category,
      model: selectedModel,
      power: item.power,
      quantity: quantity,
      totalPower: item.power * quantity
    }]);
    
    setSelectedModel('');
    setQuantity(1);
  };

  const removeEquipment = (id) => {
    setEquipment(equipment.filter(item => item.id !== id));
  };

  const calculateResults = () => {
    const totalWatts = equipment.reduce((sum, item) => sum + item.totalPower, 0);
    const diversityWatts = totalWatts * (diversityFactor / 100);
    const dcAmps = diversityWatts / 48;
    
    let rectifierSize;
    if (dcAmps <= 20) rectifierSize = 30;
    else if (dcAmps <= 40) rectifierSize = 60;
    else if (dcAmps <= 70) rectifierSize = 100;
    else if (dcAmps <= 130) rectifierSize = 200;
    else rectifierSize = Math.ceil(dcAmps / 100) * 100;
    
    const rectifierUtilization = (dcAmps / rectifierSize * 100).toFixed(1);
    
    return {
      totalWatts: totalWatts.toFixed(0),
      diversityWatts: diversityWatts.toFixed(0),
      dcAmps: dcAmps.toFixed(2),
      rectifierSize,
      rectifierUtilization,
      recommendation: dcAmps < rectifierSize * 0.8 ? 'Adequate' : 'Consider larger rectifier'
    };
  };

  const results = equipment.length > 0 ? calculateResults() : null;

  const saveCalculation = () => {
    const calc = {
      id: Date.now(),
      siteName: siteName || 'Unnamed Site',
      date: new Date().toLocaleDateString(),
      equipment: [...equipment],
      diversityFactor,
      results: results
    };
    
    setCalculations([calc, ...calculations]);
    alert(`Calculation saved for ${calc.siteName}!`);
  };

  const generateReport = () => {
    if (!results) return;
    
    let report = `DC LOAD CALCULATION REPORT\n`;
    report += `================================\n\n`;
    report += `Site Name: ${siteName || 'Unnamed Site'}\n`;
    report += `Date: ${new Date().toLocaleDateString()}\n`;
    report += `Time: ${new Date().toLocaleTimeString()}\n\n`;
    
    report += `EQUIPMENT LIST:\n`;
    report += `--------------------------------\n`;
    equipment.forEach((item, idx) => {
      report += `${idx + 1}. ${item.model}\n`;
      report += `   Category: ${item.category}\n`;
      report += `   Power: ${item.power}W × ${item.quantity} = ${item.totalPower}W\n\n`;
    });
    
    report += `POWER CALCULATIONS:\n`;
    report += `--------------------------------\n`;
    report += `Total Power (100%): ${results.totalWatts} W\n`;
    report += `Diversity Factor: ${diversityFactor}%\n`;
    report += `Effective Power: ${results.diversityWatts} W\n`;
    report += `DC Current @ -48VDC: ${results.dcAmps} A\n\n`;
    
    report += `RECTIFIER RECOMMENDATION:\n`;
    report += `--------------------------------\n`;
    report += `Recommended Size: ${results.rectifierSize} A\n`;
    report += `Utilization: ${results.rectifierUtilization}%\n`;
    report += `Status: ${results.recommendation}\n\n`;
    
    report += `Notes:\n`;
    report += `- Calculation assumes -48VDC system\n`;
    report += `- Diversity factor applied to total load\n`;
    report += `- Recommend 20% margin for future growth\n`;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DC_Load_${siteName || 'Report'}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">DC Load Adder Pro</h1>
          <p className="text-blue-200">Telecom Power Budget Calculator</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Add Equipment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g., Tower-001-Downtown"
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Equipment Category
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setSelectedModel('');
                  }}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select Category</option>
                  {Object.keys(equipmentDatabase).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {selectedType && (
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Equipment Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select Model</option>
                    {Object.keys(equipmentDatabase[selectedType]).map(model => (
                      <option key={model} value={model}>
                        {model} ({equipmentDatabase[selectedType][model].power}W)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                onClick={addEquipment}
                disabled={!selectedModel}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Equipment
              </button>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Diversity Factor: {diversityFactor}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={diversityFactor}
                  onChange={(e) => setDiversityFactor(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-blue-300 mt-1">
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Equipment List */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">Equipment List</h2>
              
              {equipment.length === 0 ? (
                <p className="text-blue-200 text-center py-8">No equipment added yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {equipment.map((item) => (
                    <div key={item.id} className="bg-white/10 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.model}</p>
                        <p className="text-blue-200 text-sm">
                          {item.power}W × {item.quantity} = {item.totalPower}W
                        </p>
                      </div>
                      <button
                        onClick={() => removeEquipment(item.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations */}
            {results && (
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Calculation Results</h2>
                
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-blue-200 text-sm">Total Power (100%)</p>
                    <p className="text-white text-2xl font-bold">{results.totalWatts} W</p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-blue-200 text-sm">Effective Power ({diversityFactor}%)</p>
                    <p className="text-white text-2xl font-bold">{results.diversityWatts} W</p>
                  </div>

                  <div className="bg-blue-500/30 rounded-lg p-4 border-2 border-blue-400">
                    <p className="text-blue-200 text-sm">DC Current @ -48VDC</p>
                    <p className="text-white text-3xl font-bold">{results.dcAmps} A</p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-blue-200 text-sm mb-2">Rectifier Recommendation</p>
                    <p className="text-white text-xl font-bold mb-1">{results.rectifierSize} A Rectifier</p>
                    <p className="text-green-300 text-sm">Utilization: {results.rectifierUtilization}%</p>
                    <p className="text-blue-200 text-sm mt-2">{results.recommendation}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveCalculation}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      Save
                    </button>
                    <button
                      onClick={generateReport}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Calculations */}
        {calculations.length > 0 && (
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Saved Calculations ({calculations.length})</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {calculations.slice(0, 6).map((calc) => (
                <div key={calc.id} className="bg-white/10 rounded-lg p-4">
                  <p className="text-white font-medium mb-1">{calc.siteName}</p>
                  <p className="text-blue-200 text-sm mb-2">{calc.date}</p>
                  <p className="text-white text-lg font-bold">{calc.results.dcAmps} A</p>
                  <p className="text-green-300 text-sm">{calc.results.rectifierSize}A Rectifier</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DCLoadAdder;
