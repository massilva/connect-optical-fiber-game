(function (window) {
    'use strict';
    var state, stage, MAX_STAGE = 5, startStage;

    function clearStage(gameContent) {
        gameContent.select("svg").remove();
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

    function checkEndGame(dataTarget, max) {
        var selecteds = d3.selectAll("g.fibreTarget.selected")[0], i, connect, hits = 0;
        if (selecteds.length === max) {
            for (i = 0; i < selecteds.length; i += 1) {
                connect = window.parseInt(d3.select(selecteds[i]).attr('data-source'));
                if (dataTarget[i] === connect) {
                    hits += 1;
                }
            }
            if (hits === max) {
                winStage();
            }
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

    function getId(idx) {
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

    startStage = function (stage) {
        state = "START";

        var source, target,
            screenWidth = window.screen.availWidth,
            selected, i,
            max = stage + 2,
            data = {},
            dataGraphic = {},
            gameBoard, gameContent,
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
            },
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
                    .attr('id', getId(fibreSource.i));
            };

        //Load game board
        gameContent = d3.select(".content").style({width: gameOptions.width + 'px'});
        clearStage(gameContent);
        gameBoard = gameContent.append("svg");
        gameBoard.attr('width', gameOptions.width + 'px');
        gameBoard.classed("h100", true);

        //Load data elements
        dataGraphic = getPositionsElements(max, gameOptions);
        source = gameBoard.selectAll("g.fibre").data(dataGraphic.source);
        target = gameBoard.selectAll("g.fibre").data(dataGraphic.target);
        drawElements(source, target, gameOptions);

        data = {source: [], target: []};
        for (i = 0; i < max; i += 1) {
            data.source[i] = i;
        }
        data.target = shuffleArray(data.source);

        /**
        * Click events
        */
        d3.selectAll('.fibreSource rect').on("click", function (d, i) { // fn(d, i)
            var g = this.parentNode;
            d3.select(g).classed("selected", true);
            selected = {d: d, i: i};
        });
        d3.selectAll('.fibreTarget rect').on("click", function (d) {
            var previouslySelected;
            if (selected) {
                previouslySelected = d3.selectAll('g[data-source="' + selected.i + '"]');
                target = this.parentNode;
                target.parentNode.appendChild(target);
                target = d3.select(target);
                if (!target.attr('data-source')) { //Not has selected
                    previouslySelected.attr('data-source', '').classed("selected", false);
                    previouslySelected.select("rect").attr('fill', gameOptions.defaultColor);
                    d3.selectAll('#' + getId(selected.i)).remove();
                    target.classed("selected", true);
                    target.attr('data-source', selected.i);
                    target.select("rect").attr('fill', gameOptions.colors[selected.i]);
                    connectFibre(selected, d);
                    checkEndGame(data.target, max);
                }
            }
        });
    };

    function menuStart() {
        state = "MENU";
        startStage(stage);
    }

    function firstPage() {
        state = "FIRST";
        stage = 0;
        menuStart();
    }

    firstPage();
}(window));
