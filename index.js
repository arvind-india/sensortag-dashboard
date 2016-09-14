var SensorTag = require('sensortag');
var Async = require('async');


console.log("Discovering SensorTags, please make sure that SensorTag is in discovery mode...");

SensorTag.discoverAll(function (sensorTag) {

    console.log("Connecting to %s...", sensorTag.id);

    sensorTag.on('disconnect', function () {
        console.log("Disconnected from %s!", sensorTag.id);
        process.exit(0);
    });

    sensorTag.connectAndSetUp(function (error) {
        console.log("Connected to %s...", sensorTag.id);

        Async.series([
            function (callback) {
                console.log("Starting IR temperatures sensor for %s...", sensorTag.id);
                sensorTag.enableIrTemperature(callback);
            },
            function (callback) {
                console.log("Starting humidity sensor for %s...", sensorTag.id);
                sensorTag.enableHumidity(callback);
            },
            function (callback) {
                console.log("Starting pressure sensor for %s...", sensorTag.id);
                sensorTag.enableBarometricPressure(callback);
            },
            function (callback) {
                console.log("Starting light intensity sensor for %s...", sensorTag.id);
                sensorTag.enableLuxometer(callback);
            }
        ], function () {
            setInterval(function () {
                var readings = {sensorId: sensorTag.id};
                Async.series([
                    function (callback) {
                        sensorTag.readHumidity(function (error, temperature, humidity) {
                            readings.humidity = humidity;
                            readings.temperatureFromHumidity = temperature;
                            callback();
                        });
                    },
                    function (callback) {
                        sensorTag.readIrTemperature(function (error, objectTemperature, ambientTemperature) {
                            readings.objectTemperature = objectTemperature;
                            readings.temperatureFromIr = ambientTemperature;
                            callback();
                        });
                    },
                    function (callback) {
                        sensorTag.readBarometricPressure(function (error, pressure) {
                            readings.pressure = pressure;
                            callback();
                        });
                    },
                    function (callback) {
                        sensorTag.readLuxometer(function (error, lux) {
                            readings.lux = lux;
                            callback();
                        });
                    }
                ], function () {
                    readings.currentTime = new Date();
                    console.log("Time - ", readings.currentTime, " - Readings = ", readings);
                });
            }, 10000);
        });
    });
});