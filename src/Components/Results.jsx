import React, { useEffect, useState } from "react";

import dolarblue from "../dolarblue.json";
import dolaroficial from "../dolaroficial.json";

const Results = (props) => {
  const [currentQuery, setCurrentQuery] = useState(props.query);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentQuery(props.query);
    if (currentQuery) {
      calculateResults(currentQuery);
    }
  }, [props]);

  const blue = dolarblue.map((doc) => {
    const dma = doc.fecha.split("-");
    return {
      day: parseInt(dma[0]),
      month: parseInt(dma[1]),
      year: parseInt(dma[2]),
      date: doc.fecha,
      compra: parseFloat(doc.compra),
      venta: parseFloat(doc.venta),
    };
  });

  const oficial = dolaroficial.map((doc) => {
    const dma = doc.fecha.split("-");
    return {
      day: parseInt(dma[0]),
      month: parseInt(dma[1]),
      year: parseInt(dma[2]),
      date: doc.fecha,
      compra: parseFloat(doc.compra),
      venta: parseFloat(doc.venta),
    };
  });

  const averageValueOf = (array) => {
    let onlyValues = array.map((item) => {
      return item.venta;
    });
    let sum = onlyValues.reduce((a, b) => a + b);
    return sum / array.length;
  };

  const filterMonthBefore = (dma, value) => {
    const { day, month, year } = dma;
    if (month === 1) {
      // Si la fecha es en los primeros 15 dias de enero, traer los valores del diciembre anterior y los de enero.
      return (
        (value.year === year - 1 && value.month === 12 && value.day >= day) ||
        (value.year === year && value.month === 1 && value.day <= day)
      );
    } else {
      // Para los demas meses devuelvo las entradas de los 30 dias anteriores.
      return (
        (value.year === year && value.month === month - 1 && value.day > day) ||
        (value.year === year && value.month === month && value.day <= day)
      );
    }
  };

  const calculateResults = (query) => {
    /* Primero busca entre las cotizaciones los valores del mes
   anterior a las fechas introducidas, tanto para el blue como para el
   oficial. Luego calcula un valor promedio para cada rango. Finalmente,
   usa esa cotizacion promedio para pasar a dólares los montos en pesos
   ingresados */

    const dolarBlueValuesOld = blue.filter((value) => {
      return filterMonthBefore(query.oldSalaryDate, value);
    });

    const dolarBlueValuesNew = blue.filter((value) => {
      return filterMonthBefore(query.newSalaryDate, value);
    });

    const dolarOficialValuesOld = oficial.filter((value) => {
      return filterMonthBefore(query.oldSalaryDate, value);
    });
    const dolarOficialValuesNew = oficial.filter((value) => {
      return filterMonthBefore(query.newSalaryDate, value);
    });

    const dolarBlueOldAvg = averageValueOf(dolarBlueValuesOld);
    const dolarBlueNewAvg = averageValueOf(dolarBlueValuesNew);
    const dolarOficialOldAvg = averageValueOf(dolarOficialValuesOld);
    const dolarOficialNewAvg = averageValueOf(dolarOficialValuesNew);

    console.log(
      "valores del dolar blue cercanos al viejo monto: ",
      dolarBlueValuesOld
    );
    console.log(
      "valores del dolar blue del mes anterior al nuevo monto: ",
      dolarBlueValuesNew
    );

    console.log(
      "Valores del dolar oficial cercanos al viejo monto:",
      dolarOficialValuesOld
    );
    console.log(
      "valores del dolar oficial cercanos al nuevo monto",
      dolarOficialValuesNew
    );
    // Junto los resultados para devolverlos:
    const calculatedResults = {
      oldBlueAvg: parseFloat(dolarBlueOldAvg),
      oldOficialAvg: parseFloat(dolarOficialOldAvg),
      newBlueAvg: parseFloat(dolarBlueNewAvg),
      newOfficialAvg: parseFloat(dolarOficialNewAvg),
      oldAmmountBlue: parseFloat(query.oldSalaryAmmount / dolarBlueOldAvg),
      oldAmmountOficial: parseFloat(
        query.oldSalaryAmmount / dolarOficialOldAvg
      ),
      newAmmountBlue: parseFloat(query.newSalaryAmmount / dolarBlueNewAvg),
      newAmmountOficial: parseFloat(
        query.newSalaryAmmount / dolarOficialNewAvg
      ),
    };
    setResults(calculatedResults);
    console.log("results", calculatedResults);
    setLoading(false);
  };

  return (
    <div className="row">
      <div className="col-md-3"></div>
      <div className="col-md-6">
        {!loading && <ResultsViewer query={currentQuery} results={results} />}
      </div>
      <div className="col-md-3"></div>
    </div>
  );
};

const ResultsViewer = (props) => {
  const oldDate = props.query.oldSalaryDate;
  const newDate = props.query.newSalaryDate;
  return (
    <div className="row">
      <div className="col-md-2"></div>
      <div className="col-md-8">
        <h1>Resultados</h1>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Old</th>
              <th scope="col">New</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Fecha</th>
              <td>{`${oldDate.year}-${oldDate.month}-${oldDate.day}`}</td>
              <td>{`${newDate.year}-${newDate.month}-${newDate.day}`}</td>
            </tr>
            <tr>
              <th scope="row">Cotizacion Blue</th>
              <td>{props.results.oldBlueAvg.toFixed(2)}</td>
              <td>{props.results.newBlueAvg.toFixed(2)}</td>
            </tr>
            <tr>
              <th scope="row">Monto Pesos</th>
              <td>{props.query.oldSalaryAmmount.toFixed(2)}</td>
              <td>{props.query.newSalaryAmmount.toFixed(2)}</td>
            </tr>
            <tr>
              <th scope="row">Monto blue</th>
              <td>{props.results.oldAmmountBlue.toFixed(2)}</td>
              <td>{props.results.newAmmountBlue.toFixed(2)}</td>
            </tr>
            <tr>
              <th scope="row">Monto Oficial</th>
              <td>{props.results.oldAmmountOficial.toFixed(2)}</td>
              <td>{props.results.newAmmountOficial.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="col-md-8"></div>
    </div>
  );
};

export default Results;
