import { useEffect, useState } from "react";
import { Chip, Accordion, AccordionSummary, AccordionDetails, Grid, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const NftFilter = (props: {
  properties: Map<string, string[]>,
  onChange: (filters: Map<string, string[]>) => any,
}) => {
  const [propsSelected, setPropsSelected] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    props.onChange(propsSelected);
  }, [props, propsSelected]);

  const traitsSelectedCount = Array.from(propsSelected.values())
    .map(o => o.length)
    .reduce((acc, curr) => acc + curr, 0);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography
          variant="subtitle1"
        >
          Traits
          {traitsSelectedCount ? (
            <>
              &nbsp;({traitsSelectedCount} selected)
            </>
          ) : null}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {Array.from(props.properties.entries())
          .map(p => {
            const attributeName = p[0];
            const attributeValues = p[1];
            return (
              <Grid
                key={attributeName}
                container
                spacing={0.5}
              >
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                  >
                    {attributeName}
                  </Typography>
                </Grid>
                {attributeValues
                  .sort((a, b) => a.localeCompare(b))
                  .map(attributeValue => (
                    <Grid
                      item
                      key={attributeValue}
                    >
                      <Chip
                        label={attributeValue}
                        variant={propsSelected.get(attributeName)?.includes(attributeValue) ? 'outlined' : undefined}
                        onClick={() => {
                          const newPropsSelected = new Map(propsSelected.entries());
                          const ps = new Set(newPropsSelected.get(attributeName) ?? []);
                          if (!ps.has(attributeValue)) {
                            ps.add(attributeValue);
                          } else {
                            ps.delete(attributeValue);
                          }
                          const newPropValues = Array.from(ps);
                          newPropsSelected.set(attributeName, newPropValues);
                          setPropsSelected(newPropsSelected);
                        }}
                      />
                    </Grid>
                  ))}
              </Grid>
            )
          })}
      </AccordionDetails>
    </Accordion>
  );
}