
// Helper function to convert numbers as strings into numbers
function dataPreProcessor(row) {
    return {
        age: row['Age'],
        malePop: +row['MalePop'],
        maleDeaths: +row['MaleDeaths'],
        maleRate: +row['MaleRate_Per_100K'],
        femalePop: +row['FemalePop'],
        femaleDeaths: +row['FemaleDeaths'],
        femaleRate: +row['FemaleRate_Per_100K'],
        totalPop: +row['TotalPop'],
        totalDeaths: +row['TotalDeaths'],
        totalRate: +row['TotalRate']
    };
}

const filename = 'TransportationFatalities_2020_ByAgeGender_postoncanvas.csv';
var data;

d3.csv(filename, dataPreProcessor).then(function(dataset) {
    data = dataset;
});

