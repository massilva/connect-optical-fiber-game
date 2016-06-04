(function () {
    'use strict';
    var state;

    function startGame(stage) {
        state = "START";
        console.log(state, "Que os jogos começem!");

        var
            gameBoard,
            i, maxStage = 5,
            numberFibres = 0,
            gSources, gTargets,
            dataFibresIn = [],
            dataFibresOut = [],
            selected,
            elements = {
                source: [],
                target: []
            },
            gameOptions = {
                width: 800,
                objectsDim: {
                    width: 50,
                    height: 50
                }
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
                    .attr('id', 'line-' + fibreSource.i);
            };

        console.log(centerObj);
        numberFibres = stage + 2;
        console.log("Fase: ", stage, " # ", numberFibres);

        gameBoard = d3.select(".content").append("svg");
        gameBoard.attr('width', gameOptions.width + 'px');
        gameBoard.classed("h100", true);

        for (i = 0; i < numberFibres; i += 1) {
            dataFibresIn.push({x: 10, y: gameOptions.objectsDim.height * i + (i + 1) * 10});
            dataFibresOut.push({x: gameOptions.width - gameOptions.objectsDim.width - 10, y: gameOptions.objectsDim.height * i + (i + 1) * 10});
        }

        gSources = gameBoard.selectAll("g.fibre").data(dataFibresIn);
        elements.source = gSources.enter().append("g")
            .attr({
                "transform" : function (d) {
                    return "translate(" + [d.x, d.y] + ")";
                },
                'class' : 'fibreSource'
            });

        elements.source.append("rect")
            .attr("width", gameOptions.objectsDim.width)
            .attr("height", gameOptions.objectsDim.height)
            .on("click", function (d, i) { // fn(d, i)
                var g = this.parentNode, isSelected = d3.select(g).classed("selected");
                d3.select(g).classed("selected", !isSelected);
                selected = {d: d, i: i};
            });

        gTargets = gameBoard.selectAll("g.fibre").data(dataFibresOut);
        elements.target = gTargets.enter().append("g")
            .attr({
                "transform" : function (d) {
                    return "translate(" + [d.x, d.y] + ")";
                },
                'class' : 'fibreTarget'
            });

        elements.target.append("rect")
            .attr("width", gameOptions.objectsDim.width)
            .attr("height", gameOptions.objectsDim.height)
            .on("click", function (d) { // fn(d, i)
                var previouslySelected, target;
                if (selected) {
                    previouslySelected = d3.selectAll('g[data-source="' + selected.i + '"]');
                    target = this.parentNode;
                    target.parentNode.appendChild(target);
                    target = d3.select(target);
                    if (!target.attr('data-source')) { //Not has selected
                        previouslySelected.attr('data-source', '').classed("selected", false);
                        d3.selectAll('#line-' + selected.i).remove();
                        target.classed("selected", true);
                        target.attr('data-source', selected.i);
                        connectFibre(selected, d);
                    }
                }
            });

        console.log(elements);
    }

    function menuStart() {
        state = "MENU";
        console.log(state);
        startGame(2);
    }

    function firstPage() {
        state = "FIRST";
        console.log(state);
        menuStart();
    }

    firstPage();
}());
