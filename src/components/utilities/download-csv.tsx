import { Button, CircularProgress } from "@mui/material"
import { json2csvAsync } from "json-2-csv";
import { useState } from "react";

export const DownloadCSV = (props: {
  data: any[],
  filename: string,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <Button
      variant="contained"
      onClick={async () => {
        if (props.data.length) {
          setIsProcessing(true);
          try {
            const csv = await json2csvAsync(props.data);
            const blob = new File([csv], props.filename, { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", props.filename);
            link.style.visibility = "none";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
          } finally {
            setIsProcessing(false);
          }
        }
      }}
    >
      {isProcessing ? (
        <CircularProgress size="sm" />
      ) : (
        "Download CSV"
      )}
    </Button>
  );
}