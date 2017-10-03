(function() {

	var config = {
    apiKey: "AIzaSyA6Hk7drZX9uuRbRnqExRKQFsGJ5bc3de4",
    authDomain: "test-c6de8.firebaseapp.com",
    databaseURL: "https://test-c6de8.firebaseio.com",
    projectId: "test-c6de8",
    storageBucket: "test-c6de8.appspot.com",
    messagingSenderId: "201430894267"
	}
	firebase.initializeApp(config);

	var app = angular.module("myApp", ["firebase", "chart.js"]);
	var wrist = [];
	var tencm = [];
	var twentycm = [];
	var thirtycm = [];
	var fortycm = [];
	var names = [];
	var name=localStorage.getItem("storageName");
	var affectedSum = [];

	var wristU = [];
	var tencmU = [];
	var twentycmU = [];
	var thirtycmU = [];
	var fortycmU = [];
	var unAffectedSum = [];

		app.controller("MyChartCtrl", function($scope, $firebaseObject, $firebaseArray) {


			const rootRef = firebase.database().ref();

			// point to the child
			const refUser = rootRef.child(name);
			const refAffected = refUser.child("affected");
			const refUnaffected = refUser.child("unaffected");

			refAffected.on('value', function(snapshot) {
				var dayReadings = snapshotToArray(snapshot);
				console.log(dayReadings);
				console.log(dayReadings[0]);      // SAME

				// create arrays for the chart
				snapshot.forEach(function(childSnapshot) {
					/*childSnapshot.forEach (function(childSnapshot2) {
						console.log(childSnapshot2.key);
					});*/
					var day = snapshotToArray(childSnapshot);
					console.log(day);

					console.log(childSnapshot.val());	// SAME
					//$scope.wrist.push(day[0]);
					/*$scope.wrist.push(childSnapshot.val().wrist);
					$scope.tencm.push(childSnapshot.val().tencm_reading);
					$scope.twentycm.push(childSnapshot.val().twentycm_reading);
					$scope.thirtycm.push(childSnapshot.val().thirtycm_reading);
					$scope.fortycm.push(childSnapshot.val().fortycm_reading);*/

				});
			});

			rootRef.on('value', function(snapshot) {
				// sync it to a local angular object
				$scope.dayReadings = $firebaseArray(refAffected);
				console.log($scope.dayReadings);
				$scope.dayReadingsUnaffected = $firebaseArray(refUnaffected);
				console.log($scope.dayReadingsUnaffected);

				// code to iterate the firebaseArray in the controller
				$scope.dayReadings.$loaded()
					.then(function(){
						//affectedSum = [];
						console.log(affectedSum.length);
						angular.forEach($scope.dayReadings, function(dayReading, index) {
							console.log(dayReading);		// SAME
							console.log(affectedSum.length);
							console.log(index);
							if (index == 0) {
								affectedSum = [];
								wrist = [];
								tencm = [];
								twentycm = [];
								thirtycm = [];
								fortycm = [];
							}
							//console.log(dayReading.wrist);
							wrist.push(dayReading.wrist);
							tencm.push(dayReading.tencm_reading);
							twentycm.push(dayReading.twentycm_reading);
							thirtycm.push(dayReading.thirtycm_reading);
							fortycm.push(dayReading.fortycm_reading);

							// data for the trend chart (wrist, 10cm, ... thoughout a week)
							$scope.trendData = [wrist, tencm, twentycm, thirtycm, fortycm];		//try to do this in the refAffected, probably the same thing
							console.log($scope.trendData);

							// compute the sum to use in interlimb chart
							affectedSum.push(parseFloat(dayReading.wrist)+parseFloat(dayReading.tencm_reading)+parseFloat(dayReading.twentycm_reading)
											+parseFloat(dayReading.thirtycm_reading)+parseFloat(dayReading.fortycm_reading));
							console.log(affectedSum);
							$scope.affectedSum = affectedSum;
						});

						// chart variables
						$scope.labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
						$scope.type = "line";
						$scope.chartTypes = ["Trend", "Interlimb(cm)", "Interlimb(%)"];


							// reassign the chart variables to match the correct graph

								if ($scope.chartType == "Trend") {
									$scope.series = ["wrist", "10cm", "20cm", "30cm", "40cm"];
									$scope.data = $scope.trendData;
									$scope.options = {
										legend: { display: true },
										elements: {
										  line: {
											tension: 0.3,
										  }
										},
										title: {
										  display: true,
										  text: "Limb circumference at different points over time(cm)",
										  fontSize: 20
										}
									};
									console.log($scope.data);

								} else if ($scope.chartType == "Interlimb(cm)") {
									console.log("InterLimb");
									$scope.series = ["Difference"];
									var diff = [[]];
									angular.forEach($scope.affectedSum, function(value,index) {
										console.log(value);
										console.log($scope.unAffectedSum[0]);
										diff[0].push(value - $scope.unAffectedSum[0]);
									});
									console.log(diff);
									$scope.data = diff;
									$scope.options = {
										legend: { display: true },
										elements: {
										  line: {
											tension: 0.3,
										  }
										},
										title: {
										  display: true,
										  text: "Sum of inter-limb circumference difference over time(cm)",
										  fontSize: 20
										}
									};
								} else if ($scope.chartType == "Interlimb(%)") {
									console.log("InterLimb %");
									$scope.series = ["% excess oedema"];
									var diff = [[]];
									angular.forEach($scope.affectedSum, function(value,index) {
										console.log(value);
										console.log($scope.unAffectedSum[0]);
										diff[0].push(value - $scope.unAffectedSum[0]);
									});
									$scope.data = [[0, 1, 4]];
									$scope.options = {
										legend: { display: true },											// TODO %Interlimb
										elements: {
										  line: {
											tension: 0.3,
										  }
										},
										title: {
										  display: true,
										  text: "Inter-limb circumference difference as %",
										  fontSize: 20
										}
									};
								} else {
									$scope.series = ["wrist", "10cm", "20cm", "30cm", "40cm"];
									$scope.data = $scope.trendData;
									$scope.options = {
										legend: { display: true },
										elements: {
										  line: {
											tension: 0.3,
										  }
										},
										title: {
										  display: true,
										  text: "Limb circumference at different points over time(cm)",
										  fontSize: 20
										}
									};
								}
					});

				// getting data from unaffected and compute the sum for each day
				$scope.dayReadingsUnaffected.$loaded()
					.then(function(){
						angular.forEach($scope.dayReadingsUnaffected, function(dayReadingUnaffected, index) {
							console.log(dayReadingUnaffected);		// SAME
							if (index == 0) {
								unAffectedSum = [];
							}
							//console.log(dayReading.wrist);
							wristU.push(dayReadingUnaffected.wrist);
							tencmU.push(dayReadingUnaffected.tencm_reading);
							twentycmU.push(dayReadingUnaffected.twentycm_reading);
							thirtycmU.push(dayReadingUnaffected.thirtycm_reading);
							fortycmU.push(dayReadingUnaffected.fortycm_reading);

							// compute the sum to use in interlimb chart
							unAffectedSum.push(parseFloat(dayReadingUnaffected.wrist)+parseFloat(dayReadingUnaffected.tencm_reading)+parseFloat(dayReadingUnaffected.twentycm_reading)
												+parseFloat(dayReadingUnaffected.thirtycm_reading)+parseFloat(dayReadingUnaffected.fortycm_reading));
							console.log(unAffectedSum);
							$scope.unAffectedSum = unAffectedSum;
						});

						// chart variables
						$scope.labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
						$scope.type = "line";
						$scope.chartTypes = ["Trend", "Interlimb(cm)", "Interlimb(%)"];


							// reassign the chart variables to match the correct graph

								if ($scope.chartType == "Trend") {
									$scope.series = ["wrist", "10cm", "20cm", "30cm", "40cm"];
									$scope.data = $scope.trendData;
									$scope.options = {
										legend: { display: true },
										elements: {
										  line: {
											tension: 0.3,
										  }
										},
										title: {
										  display: true,
										  text: "Limb circumference at different points over time(cm)",
										  fontSize: 20
										}
									};
									console.log($scope.data);

								} else if ($scope.chartType == "Interlimb(cm)") {
									console.log("InterLimb");
									$scope.series = ["Difference"];
									var diff = [[]];
									angular.forEach($scope.affectedSum, function(value,index) {
										console.log(value);
										console.log($scope.unAffectedSum[0]);
										diff[0].push(value - $scope.unAffectedSum[0]);
									});
									console.log(diff);
									$scope.data = diff;
									$scope.options = {
										legend: { display: true },
										elements: {
										  line: {
											tension: 0.3,
										  }
										},
										title: {
										  display: true,
										  text: "Summed inter-limb circumference difference over time(cm)",
										  fontSize: 20
										}
									};
								} else if ($scope.chartType == "Interlimb(%)") {
									console.log("InterLimb %");
									$scope.series = ["% excess oedema"];
									var diff = [[]];
									angular.forEach($scope.affectedSum, function(value,index) {
										console.log(value);
										console.log($scope.unAffectedSum[0]);
										diff[0].push(value - $scope.unAffectedSum[0]);
									});
									$scope.data = [[0, 1, 4]];
									$scope.options = {
										legend: { display: true },											// TODO %Interlimb
										elements: {
										  line: {
											tension: 0.3,
										  }
										},
										title: {
										  display: true,
										  text: "Inter-limb circumference difference as %",
										  fontSize: 20
										}
									};
								} else {
									$scope.series = ["wrist", "10cm", "20cm", "30cm", "40cm"];
									$scope.data = $scope.trendData;
									$scope.options = {
										legend: { display: true },
										elements: {
										  line: {
											tension: 0.3,
										  }
										},
										title: {
										  display: true,
										  text: "Limb circumference at different points over time(cm)",
										  fontSize: 20
										}
									};
								}
					});
			});  // end of on(value) method





			// Create the graph when choosing options
			// chart variables
			$scope.labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
			$scope.type = "line";
			//$scope.series = ["wrist", "10cm", "20cm", "30cm", "40cm"];


			$scope.chartTypes = ["Trend", "Interlimb(cm)", "Interlimb(%)"];

			$scope.toggle = function() {

				// reassign the chart variables to match the correct graph

				//$scope.$watch('chartType', function () {
					if ($scope.chartType == "Trend") {
						console.log("Trend");
						$scope.series = ["wrist", "10cm", "20cm", "30cm", "40cm"];
						$scope.data = $scope.trendData;
						$scope.options = {
							legend: { display: true },
							elements: {
							  line: {
								tension: 0.3,
							  }
							},
							title: {
							  display: true,
							  text: "Limb circumference at different points over time(cm)",
							  fontSize: 20
							}
						};
					} else if ($scope.chartType == "Interlimb(cm)") {
						console.log("InterLimb");
						$scope.series = ["Difference"];
						var diff = [[]];
						angular.forEach($scope.affectedSum, function(value,index) {
							console.log(value);
							console.log($scope.unAffectedSum[0]);
							diff[0].push(value - $scope.unAffectedSum[0]);
						});
						console.log(diff);
						$scope.data = diff;
						$scope.options = {
							legend: { display: true },
							elements: {
							  line: {
								tension: 0.3,
							  }
							},
							title: {
							  display: true,
							  text: "Summed inter-limb circumference difference over time(cm)",
							  fontSize: 20
							}
						};
					} else if ($scope.chartType == "Interlimb(%)") {
						console.log("InterLimb %");
						$scope.series = ["% excess oedema"];
						var diff = [[0]];
						var oldValue;
						var newValue;
						var percent;
						angular.forEach($scope.affectedSum, function(value,index) {
							console.log(value);
							console.log($scope.unAffectedSum[0]);
							if (index == 0) {
								oldValue = value - $scope.unAffectedSum[0];
							} else {
								newValue = value - $scope.unAffectedSum[0];
								percent = ((newValue - oldValue) / (oldValue)) * 100;
								oldValue = value - $scope.unAffectedSum[0];
								diff[0].push(percent);
							}
						});
						$scope.data = diff;
						$scope.options = {
							legend: { display: true },											// TODO %Interlimb
							elements: {
							  line: {
								tension: 0.3,
							  }
							},
							title: {
							  display: true,
							  text: "Inter-limb circumference difference as %",
							  fontSize: 20
							}
						};
					}
				//});
			};


		}); // end of the controller

	function snapshotToArray(snapshot) {
		var returnArr = [];


		snapshot.forEach(function(childSnapshot) {
			var item = childSnapshot.val();
			item.key = childSnapshot.key;

					returnArr.push(item);
		});

		return returnArr;
	};


}())
