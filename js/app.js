(function (window) {
    'use strict';
    var stage, MAX_STAGE = 5, startStage, startGame,
        screenWidth = window.screen.availWidth,
        gameOptions = {
            width: screenWidth * 0.8,
            objectsDim: {
                width: 50,
                height: 50
            },
            transform: function (d) {
                return "translate(" + [d.x, d.y] + ")";
            },
            colors: ["#2ecc71", "#f1c40f", "#16a085", "#c0392b", "#8e44ad", "#2c3e50", "#d35400"],
            defaultColor: "#bdc3c7"
        };

    function clearStage(gameContent) {
        gameContent.select("svg").remove();
    }

    function getGameContent() {
        return d3.select(".content").style({width: gameOptions.width + 'px'});
    }

    function createGameBoard() {
        var gameContent, gameBoard;
        gameContent = getGameContent();
        clearStage(gameContent);
        gameBoard = gameContent.append("svg");
        gameBoard.attr('width', gameOptions.width + 'px');
        gameBoard.classed("h100", true);
        return gameBoard;
    }

    function nextStage() {
        stage += 1;
    }

    function winStage() {
        if (stage < MAX_STAGE) {
            nextStage();
            startStage(stage);
        }
    }

    function lostStage(dataTarget, hits, max) {
        var gameBoard = createGameBoard();
        gameBoard.append('text')
            .text('You hit(s)')
            .attr('x', gameOptions.width * 0.5)
            .attr('y', 150)
            .attr('font-size', '5em')
            .attr('fill', '#2980b9')
            .attr('text-anchor', 'middle');
        gameBoard.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', gameOptions.width * 0.5)
            .attr('y', 320)
            .text(hits + ' of ' + max + '.')
            .attr('font-size', '10em')
            .attr('fill', 'red');
        gameBoard.append('text')
            .attr('class', 'btn')
            .attr('text-anchor', 'middle')
            .attr('x', gameOptions.width * 0.5)
            .attr('y', 450)
            .text('Restart')
            .attr('font-size', '5em')
            .attr('fill', '#2980b9')
            .on('click', function () {
                gameBoard.selectAll('text').remove();
                startGame(gameBoard, dataTarget, max);
            });
    }

    function endGame(dataTarget, dataSelected, max) {
        var i, hits = 0;
        for (i = 0; i < dataSelected.length; i += 1) {
            if (dataTarget[i] === dataSelected[i]) {
                hits += 1;
            }
        }
        if (hits === max) {
            winStage();
        } else {
            lostStage(dataTarget, hits, max);
        }
    }

    function shuffleArray(arr) {
        var j, x, i, newArr = [];
        for (i = arr.length - 1; i >= 0; i -= 1) {
            newArr[i] = arr[i];
        }
        for (i = newArr.length - 1; i >= 0; i -= 1) {
            j = Math.floor(Math.random() * i);
            x = newArr[i];
            newArr[i] = newArr[j];
            newArr[j] = x;
        }
        return newArr;
    }

    function getLineId(idx) {
        return 'line-' + idx;
    }

    function drawElements(source, target, gameOptions) {
        var elements = {
            source: [],
            target: []
        };

        elements.source = source.enter().append("g")
            .attr({
                "transform" : gameOptions.transform,
                'class' : 'fibreSource'
            });
        elements.source.append("rect")
            .attr({
                "width": gameOptions.objectsDim.width,
                "height": gameOptions.objectsDim.height,
                "fill": function (d, i) {
                    return gameOptions.colors[i];
                },
                "opacity": 0.75
            });

        elements.target = target.enter().append("g")
            .attr({
                "transform" : gameOptions.transform,
                'class' : 'fibreTarget'
            });
        elements.target.append("rect")
            .attr({
                "width": gameOptions.objectsDim.width,
                "height": gameOptions.objectsDim.height,
                "fill": gameOptions.defaultColor
            });
        return elements;
    }

    function getPositionsElements(len, gameOptions) {
        var i, data;
        data = {
            source: [],
            target: []
        };
        for (i = 0; i < len; i += 1) {
            data.source.push({x: 10, y: gameOptions.objectsDim.height * i + (i + 1) * 10});
            data.target.push({x: gameOptions.width - gameOptions.objectsDim.width - 10, y: gameOptions.objectsDim.height * i + (i + 1) * 10});
        }
        return data;
    }

    startGame = function (gameBoard, dataTarget, max) {
        var dataGraphic = {}, dataSelected = [], countSelected = 0,
            target, source, selected,
            centerObj = {
                x : gameOptions.objectsDim.width / 2,
                y : gameOptions.objectsDim.height / 2
            },
            connectFibre = function (fibreSource, fibreTarget) {
                gameBoard.insert("line", ":first-child")
                    .attr('x1', centerObj.x + fibreSource.d.x)
                    .attr('y1', centerObj.y + fibreSource.d.y)
                    .attr('x2', centerObj.x + fibreTarget.x)
                    .attr('y2', centerObj.y + fibreTarget.y)
                    .attr('stroke-width', 5)
                    .attr('stroke', 'black')
                    .attr('id', getLineId(fibreSource.i));
            };

        //Load data elements
        dataGraphic = getPositionsElements(max, gameOptions);
        source = gameBoard.selectAll("g.fibre").data(dataGraphic.source);
        target = gameBoard.selectAll("g.fibre").data(dataGraphic.target);
        drawElements(source, target, gameOptions);
        /**
        * Click events
        */
        d3.selectAll('.fibreSource rect').on("click", function (d, i) { // fn(d, i)
            var g = this.parentNode;
            d3.select(g).classed("selected", true);
            selected = {d: d, i: i};
        });
        d3.selectAll('.fibreTarget rect').on("click", function (d, i) {
            var previouslySelected;
            if (selected) {
                previouslySelected = d3.selectAll('g[data-source="' + selected.i + '"]');
                target = this.parentNode;
                target.parentNode.appendChild(target);
                target = d3.select(target);
                if (!target.attr('data-source')) { //Not has selected
                    previouslySelected.attr('data-source', '').classed("selected", false);
                    previouslySelected.select("rect").attr('fill', gameOptions.defaultColor);
                    d3.selectAll('#' + getLineId(selected.i)).remove();
                    target.classed("selected", true);
                    target.attr('data-source', selected.i);
                    target.select("rect").attr('fill', gameOptions.colors[selected.i]);
                    dataSelected[selected.i] = i;
                    connectFibre(selected, d);
                    countSelected += 1;
                    if (countSelected === max) {
                        endGame(dataTarget, dataSelected, max);
                    }
                }
            }
        });
    };

    startStage = function (stage) {

        var i, max = stage + 2,
            data = {},
            gameBoard;

        data = {source: [], target: []};
        for (i = 0; i < max; i += 1) {
            data.source[i] = i;
        }
        data.target = shuffleArray(data.source);

        //Load game board
        gameBoard = createGameBoard();
        startGame(gameBoard, data.target, max);

    };

    function menuStart() {
        startStage(stage);
    }

    function firstPage() {
        stage = 0;
        menuStart();
    }

    firstPage();
}(window));
