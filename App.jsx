import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import './index.css';

const App = () => {
  const [originalData, setOriginalData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [selectedXColumn, setSelectedXColumn] = useState('');
  const [selectedYColumns, setSelectedYColumns] = useState([]);
  const [plotTitle, setPlotTitle] = useState('Interactive Line Plot');
  const [xAxisLabel, setXAxisLabel] = useState('X-Axis');
  const [yAxisLabel, setYAxisLabel] = useState('Y-Axis');
  const [lineStyle, setLineStyle] = useState('solid');
  const [showMarkers, setShowMarkers] = useState(true);
  const [colors, setColors] = useState({});
  const [plotData, setPlotData] = useState([]);
  const [plotLayout, setPlotLayout] = useState({
    title: 'Interactive Line Plot',
    xaxis: { title: 'X-Axis' },
    yaxis: { title: 'Y-Axis' },
    hovermode: 'closest',
    autosize: true,
    margin: { l: 60, r: 20, t: 70, b: 60 }
  });
  const [plotConfig, setPlotConfig] = useState({
    displayModeBar: true,
    responsive: true
  });

  useEffect(() => {
    const dummyData = [
      { year: 2000, sales_us: 100, sales_eu: 80, profit: 20 },
      { year: 2001, sales_us: 120, sales_eu: 90, profit: 25 },
      { year: 2002, sales_us: 150, sales_eu: 110, profit: 30 },
      { year: 2003, sales_us: 130, sales_eu: 95, profit: 22 },
      { year: 2004, sales_us: 160, sales_eu: 120, profit: 35 },
    ];
    setOriginalData(dummyData);
    const initialColumns = Object.keys(dummyData[0] || {});
    setColumns(initialColumns);
    if (initialColumns.length > 0) {
      setSelectedXColumn(initialColumns[0]);
      if (initialColumns.length > 1) {
        setSelectedYColumns([initialColumns[1]]);
        setColors({ [initialColumns[1]]: '#4299E1' });
      }
    }
    setFileUploaded(true);
  }, []);

  const updatePlotData = useCallback(() => {
    if (!originalData.length || !selectedXColumn || selectedYColumns.length === 0) {
      setPlotData([]);
      return;
    }

    const newPlotData = selectedYColumns.map((yCol) => {
      const currentColor = colors[yCol] || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      if (!colors[yCol]) {
        setColors(prev => ({ ...prev, [yCol]: currentColor }));
      }
      return {
        x: originalData.map(row => row[selectedXColumn]),
        y: originalData.map(row => row[yCol]),
        mode: showMarkers ? 'lines+markers' : 'lines',
        name: yCol,
        type: 'scatter',
        line: {
          color: currentColor,
          dash: lineStyle === 'dashed' ? 'dash' : (lineStyle === 'dotted' ? 'dot' : 'solid')
        },
        marker: {
          symbol: 'circle',
          size: 8,
          color: currentColor
        }
      };
    });
    setPlotData(newPlotData);
  }, [originalData, selectedXColumn, selectedYColumns, lineStyle, showMarkers, colors]);

  useEffect(() => {
    setPlotLayout(prev => ({
      ...prev,
      title: plotTitle,
      xaxis: { title: xAxisLabel },
      yaxis: { title: yAxisLabel }
    }));
  }, [plotTitle, xAxisLabel, yAxisLabel]);

  useEffect(() => {
    updatePlotData();
  }, [updatePlotData]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      let parsedData = [];
      let headerColumns = [];
      try {
        if (file.name.endsWith('.csv')) {
          Papa.parse(content, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              parsedData = results.data;
              headerColumns = results.meta.fields || Object.keys(parsedData[0] || {});
              setOriginalData(parsedData);
              setColumns(headerColumns);
              setFileUploaded(true);
              setSelectedXColumn(headerColumns[0] || '');
              setSelectedYColumns(headerColumns.length > 1 ? [headerColumns[1]] : []);
              setColors({});
              updatePlotData();
            }
          });
        } else if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(content);
          if (Array.isArray(parsedData)) {
            headerColumns = Object.keys(parsedData[0]);
            setOriginalData(parsedData);
            setColumns(headerColumns);
            setFileUploaded(true);
            setSelectedXColumn(headerColumns[0] || '');
            setSelectedYColumns(headerColumns.length > 1 ? [headerColumns[1]] : []);
            setColors({});
            updatePlotData();
          }
        } else {
          alert("Unsupported file type.");
        }
      } catch (error) {
        alert("Error parsing file: " + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleYColumnChange = (event) => {
    const selected = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedYColumns(selected);
    const newColors = { ...colors };
    selected.forEach(col => {
      if (!newColors[col]) {
        newColors[col] = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      }
    });
    setColors(newColors);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-200 border-r p-4">
        <h2 className="text-xl font-bold text-gray-900">ScientiFlow</h2>
        <p className="text-sm text-gray-700 mb-2">Data Visualization</p>
        <hr className="border-gray-400 mb-4" />
        <ul className="space-y-2">
          
          <li className="hover:text-blue-600 cursor-pointer">Dashboard</li>
          <li className="hover:text-blue-600 cursor-pointer">Visualization</li>
          <li className="hover:text-blue-600 cursor-pointer">Datasets</li>
          <li className="hover:text-blue-600 cursor-pointer">Reports</li>
          <li className="hover:text-blue-600 cursor-pointer">Settings</li>
           <hr className="border-gray-400 mb-4" />
           <li className="hover:text-blue-600 cursor-pointer">Home</li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-grow p-6 overflow-auto bg-white">
        <h1 className="text-2xl font-semibold mb-4">Line Plot</h1>

        {/* File Upload */}
        <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="mb-4" />

        {fileUploaded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select X-Axis:</label>
              <select value={selectedXColumn} onChange={(e) => setSelectedXColumn(e.target.value)} className="p-2 border rounded w-full">
                <option value="">-- Select X Column --</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Y-Axis:</label>
              <select multiple value={selectedYColumns} onChange={handleYColumnChange} className="p-2 border rounded w-full h-32">
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Plot configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" value={plotTitle} onChange={(e) => setPlotTitle(e.target.value)} placeholder="Plot Title" className="p-2 border rounded" />
          <input type="text" value={xAxisLabel} onChange={(e) => setXAxisLabel(e.target.value)} placeholder="X-Axis Label" className="p-2 border rounded" />
          <input type="text" value={yAxisLabel} onChange={(e) => setYAxisLabel(e.target.value)} placeholder="Y-Axis Label" className="p-2 border rounded" />
          <select value={lineStyle} onChange={(e) => setLineStyle(e.target.value)} className="p-2 border rounded">
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)} />
            <span>Show Markers</span>
          </label>
        </div>

        {/* Color Pickers */}
        {selectedYColumns.map(col => (
          <div key={col} className="mb-2">
            <label>{col} Color:</label>
            <input type="color" value={colors[col] || '#000000'} onChange={(e) => setColors(prev => ({ ...prev, [col]: e.target.value }))} className="ml-2" />
          </div>
        ))}

        {/* Plot */}
        {plotData.length > 0 ? (
          <Plot data={plotData} layout={plotLayout} config={plotConfig} className="w-full h-[600px]" useResizeHandler={true} />
        ) : (
          <p className="text-gray-600 mt-8">Upload a file or select valid columns to display the plot.</p>
        )}
      </main>
    </div>
  );
};

export default App;
