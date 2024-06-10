import React, { useState } from 'react';
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridToolbar,
  GridItemChangeEvent,
  GridRowProps
} from '@progress/kendo-react-grid';
import { process, DataResult, State } from '@progress/kendo-data-query';
import { Button } from '@progress/kendo-react-buttons';
import './App.scss';

interface DataItem {
  id: number;
  name: string;
  dob: Date;
  rollNumber: string;
  city: string;
  inEdit?: boolean;
}

const initialData: DataItem[] = [
  { id: 1, name: 'John Doe', dob: new Date(1990, 1, 1), rollNumber: '123', city: '' }, // Empty city
  { id: 2, name: 'Jane Smith', dob: new Date(1985, 5, 23), rollNumber: '456', city: '' }, // Empty city
  { id: 3, name: 'Sam Johnson', dob: new Date(2000, 3, 15), rollNumber: '789', city: '' }, // Empty city
  { id: 4, name: 'Chris Lee', dob: new Date(1995, 7, 30), rollNumber: '101', city: '' } // Empty city
];

const validCities = ['A', 'B', 'C', 'D'];

const App: React.FC = () => {
  const [dataState, setDataState] = useState<State>({ skip: 0, take: 10 });
  const [data, setData] = useState<DataResult>({ data: initialData, total: initialData.length });
  const [editingItem, setEditingItem] = useState<DataItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invalidCells, setInvalidCells] = useState<Set<number>>(new Set());

  const handleDataStateChange = (event: GridDataStateChangeEvent) => {
    const { dataState } = event;
    setDataState(dataState);
    setData(process(initialData, dataState));
  };

  const validateCity = (city: string): boolean => {
    return validCities.includes(city);
  };

  const handleSave = () => {
    if (editingItem) {
      if (!validateCity(editingItem.city)) {
        setErrorMessage(`City "${editingItem.city}" is not valid. Please choose a valid city.`);
        setInvalidCells(new Set([editingItem.id]));
        return;
      }
      setData((prevData) => ({
        ...prevData,
        data: prevData.data.map(item => item.id === editingItem.id ? editingItem : item)
      }));
      setEditingItem(null);
      setErrorMessage(null);
      setInvalidCells(new Set());
    }
  };

  const handleItemChange = (event: GridItemChangeEvent) => {
    const { dataItem, field, value } = event;
    setEditingItem({
      ...dataItem,
      [field as string]: value
    });
  };

  const handleCheckButtonClick = (dataItem: DataItem) => {
    if (!validateCity(dataItem.city)) {
      setErrorMessage(`City "${dataItem.city}" is not valid. Please choose a valid city.`);
      setInvalidCells(new Set([dataItem.id]));
    } else {
      setErrorMessage(null);
      setInvalidCells(new Set());
    }
  };

  const CityCell = (props: any) => {
    const { dataItem, field } = props;
    const [city, setCity] = useState(dataItem[field] || ''); // Ensure it defaults to an empty string
    const [isEdited, setIsEdited] = useState(false);
    const [isValid, setIsValid] = useState(validateCity(city)); // Check validity initially

    const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setCity(newValue);
      setIsEdited(true);
      setIsValid(validateCity(newValue)); // Update validity on change
      handleItemChange({ ...props, value: newValue });
    };

    const handleBlur = () => {
      setIsEdited(false);
    };

    const className = (isEdited || invalidCells.has(dataItem.id)) ? (isValid ? '' : 'error') : ''; // Apply error class if edited or invalid

    return (
      <td className={className}>
        <input
          type="text"
          value={city}
          onChange={handleCityChange}
          onBlur={handleBlur}
          placeholder="Enter city..."
        />
        <Button onClick={() => handleCheckButtonClick(dataItem)}>Check</Button>
      </td>
    );
  };

  const RowRender = (trElement: React.ReactElement<HTMLTableRowElement>, props: GridRowProps) => {
    const isCityValid = validateCity(props.dataItem.city);
    const className = isCityValid ? '' : 'error-row';

    return React.cloneElement(trElement, { className });
  };

  return (
    <div className="grid-container">
      <h1>KendoReact Data Grid</h1>
      <Grid
        data={data}
        pageable
        sortable
        filterable
        {...dataState}
        onDataStateChange={handleDataStateChange}
        style={{ height: '400px' }}
        editField="inEdit"
        onItemChange={handleItemChange}
        rowRender={RowRender}
      >
        <GridToolbar>
          {editingItem && (
            <div>
              <Button onClick={handleSave}>Save</Button>
              <Button onClick={() => setEditingItem(null)}>Cancel</Button>
              {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            </div>
          )}
        </GridToolbar>
        <GridColumn field="name" title="Name" />
        <GridColumn field="dob" title="Date of Birth" filter="date" format="{0:d}" />
        <GridColumn field="rollNumber" title="Roll Number" />
        <GridColumn field="city" title="City" cell={CityCell} />
      </Grid>
    </div>
  );
};

export default App;
