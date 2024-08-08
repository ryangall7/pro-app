import { useState, useCallback, useRef, useEffect } from "react";
import {
  Card,
  TextField,
  DatePicker,
  Popover,
  VerticalStack,
  Box,
  Icon,
} from "@shopify/polaris";

import { CalendarMinor } from "@shopify/polaris-icons";

export function DatePickerInput({label = "Pick Date", selectedDate, setSelectedDate}) {

  const [visible, setVisible] = useState(false);

  const [{ month, year }, setDate] = useState({
    month: selectedDate ? selectedDate?.getMonth() : new Date().getMonth(),
    year: selectedDate ? selectedDate?.getFullYear() : new Date().getFullYear(),
  });
  const formattedValue = selectedDate ? selectedDate?.toISOString().slice(0, 10) : '';

  function handleInputValueChange() {
    console.log("handleInputValueChange");
  }
  function handleOnClose({ relatedTarget }) {
    setVisible(false);
  }
  function handleMonthChange(month, year) {
    setDate({ month, year });
  }
  function handleDateSelection({ end: newSelectedDate }) {
    setSelectedDate(newSelectedDate);
    setVisible(false);
  }
  useEffect(() => {
    if (selectedDate) {
      setDate({
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
      });
    }
  }, [selectedDate]);

  return (
    <VerticalStack inlineAlign="start" gap="4">
      <Box minWidth="276px" padding={{ xs: 2 }}>
        <Popover
          active={visible}
          autofocusTarget="none"
          preferredAlignment="center"
          fullWidth
          preferInputActivator={false}
          preferredPosition="below"
          preventCloseOnChildOverlayClick
          onClose={handleOnClose}
          activator={
            <TextField
              role="combobox"
              label={label}
              prefix={<Icon source={CalendarMinor} />}
              value={formattedValue}
              onFocus={() => setVisible(true)}
              onChange={handleInputValueChange}
              autoComplete="off"
            />
          }
        >
          <DatePicker
            month={month}
            year={year}
            selected={selectedDate}
            onMonthChange={handleMonthChange}
            onChange={handleDateSelection}
          />
        </Popover>
      </Box>
    </VerticalStack>
  )
}