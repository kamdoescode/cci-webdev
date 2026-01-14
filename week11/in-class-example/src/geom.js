// NOTE: I know the Math.js library has a lot of matrices functionality,
// I wanted to code it myself to understand it better. It also let me code the more complex algorithmic shapes
// and simply input the final geometry into THREEJS
export class Matrix {
    constructor( matrix ) {
        this.matrix = matrix;
        this.shape = this.getShape();
        this.allPaths = this.getAllPaths();
    }
    clone() {
        return new Matrix( [ ...this.matrix ] )
    }
    getShape( matrix ) {
        let tempMatrix = matrix === undefined ? this.matrix : matrix;
        let shape = [];
        while( isIterable(tempMatrix) ) {
            if( tempMatrix.length === 0 ) {
                throw "Incorrect matrix shape!"
            }
            shape.push(tempMatrix.length);
            tempMatrix = tempMatrix[0];
        }
        return shape
    }
    getBranch( branchPath ) {
        let output = this.matrix;
        branchPath.forEach( dimensionIndex => {
            output = output[ dimensionIndex ];
        })
        return output;
    }
    setBranch( branchData, branchPath ) {
        let initialData = this.getBranch( branchPath );

        if (!(isIterable( branchData ) || isIterable( initialData )) || (this.getShape( initialData ) === this.getShape( branchData ) )) {

            let parentBranch = this.getBranch( branchPath.slice( 0, -1 ) );
            parentBranch[ branchPath[branchPath.length - 1]] = branchData;

        } else throw "Branch data shapes do not match!"
    }
    getTransposedMatrix() {
        if( this.shape.length !== 2 ) {
            throw "Incorrect dimensions count for transposition!"
        } else {
            let transposedMatrix = [];
            for( let n = 0; n < this.shape[ 1 ]; n++ ) {
                transposedMatrix.push( [] );
                for( let m = 0; m < this.shape[ 0 ]; m++ ) {
                    transposedMatrix[ n ].push( this.matrix[ m ][ n ] );
                }
            }
            return new Matrix( transposedMatrix )
        }
    }
    getAllPaths() {
        // returns all possible paths of a matrix in the form of a list of lists (list of paths)
        const shape = this.shape;

        let tempDimensions = [[]];
        for( let i = 0; i < shape.length; i++) {

            let dimensionRange = [ ...new Array(shape[ i ]).keys() ];
            let newDimensions = [];

            tempDimensions.forEach( path => {
                dimensionRange.forEach( indexToAdd => {
                    let newPath = [ ...path ];
                    newPath.push( indexToAdd );
                    newDimensions.push( newPath );
                })
            } )

            tempDimensions = [ ...newDimensions ];
        }
        return tempDimensions;
    }
    multiplyByNumber( multiplier ) {
        this.allPaths.forEach( path => {
            this.setBranch( this.getBranch( path ) * multiplier, path );
        })
    }
    divideByNumber( divider ) {
        this.allPaths.forEach( path => {
            this.setBranch( this.getBranch( path ) / divider, path );
        })
    }
    add( matrixToAdd ) {
        if( this.shapesAreIdentical( matrixToAdd ) ) {
            this.allPaths.forEach( path => {
                this.setBranch( this.getBranch( path ) + matrixToAdd.getBranch( path ), path)
            } )
        } else throw `Can't perform addition. Matrices' shapes do not match!, ${this.shape}, ${matrixToAdd.shape}`
    }
    getSum( matrixToAdd ) {
        let newMatrix = this.clone();
        newMatrix.add(matrixToAdd);
        return newMatrix
    }
    subtract( matrixToSubtract ) {
        if( this.shapesAreIdentical( matrixToSubtract ) ) {
            this.allPaths.forEach( path => {
                this.setBranch( this.getBranch( path ) - matrixToSubtract.getBranch( path ), path)
            } )
        } else throw `Can't perform addition. Matrices' shapes do not match!, ${this.shape}, ${matrixToSubtract.shape}`

    }
    getDifference( matrixToSubtract ) {
        let newMatrix = this.clone();
        newMatrix.add(matrixToSubtract);
        return newMatrix
    }
    getDotProduct( matrix2 ) {
        if( this.shape.length !== 2 || matrix2.shape.length !== 2 ) {
            throw "Incorrect dimensions count for dot product!"
        } else if ( this.shape[0] !== matrix2.shape[1] ) {
            throw "Incorrect matrix shape for dot product!"
        } else {
            throw "Not implemented"
        }
    }
    shapesAreIdentical( matrixToCompare ) {
        if( this.shape.length !== matrixToCompare.shape.length ) {
            return false
        } else {
            this.shape.forEach( ( dimensionSize, dimensionIndex ) => {
                if( dimensionSize !== matrixToCompare.shape[ dimensionIndex ] ) {
                    return false
                }
            } )
            return true
        }
    }
}

export class BaseVectorOrPoint {
    constructor( x= 0, y= 0, z= 0, matrixObj= undefined, ) {
        if( matrixObj === undefined ) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.matrix = new Matrix([ x, y, z ]);
        } else if( matrixObj.shape.length !== 1 || matrixObj.shape[ 0 ] !== 3 ) {
            throw "Incorrect input matrix size for a correct Point3d/Vector3d: ${matrix.sizeX}!"
        } else {
            this.updateCoordinates(matrixObj);
        }
    }
    updateCoordinates() {
        [ this.x, this.y, this.z ] = this.matrix.matrix;
    }
    updateMatrix( matrixObj ) {
        this.matrix = matrixObj;
        this.updateCoordinates();
    }
    translate( vector3d ) {
        this.matrix.add( vector3d.matrix );
        this.updateCoordinates();
    }
}

export class Vector3d extends BaseVectorOrPoint{
    getLength() {
        return Math.sqrt(
            Math.abs(this.x * this.x) +
            Math.abs(this.y * this.y) +
            Math.abs(this.z * this.z)
        )
    }
    getNormalised() {
        let normalisedMatrix = this.matrix.clone();
        normalisedMatrix.divideByNumber( this.getLength() );
        return new Vector3d( ...normalisedMatrix.matrix )
    }
    getScaled( scale ) {
        let newVectorMatrix = this.matrix.clone();
        newVectorMatrix.multiplyByNumber( scale );
        return new Vector3d( ...newVectorMatrix.matrix )
    }
    crossProduct( vectorB ) {
        if( this.matrix.matrix.length !== 3 || vectorB.matrix.matrix.length !== 3 ) {
            throw "Cross product calculation for provided vectors dimensions not implemented and/or not possible"
        }
        let [ u0, u1, u2 ] = this.matrix.matrix;
        let [ v0,v1, v2 ] = vectorB.matrix.matrix;
        let crossProduct = new Vector3d(
            u1 * v2 - v2 * u1,
            u2 * v0 - u0 * v2,
            u0 * v1 - u1 * v0,
            );
        return new Vector3d(
            u1 * v2 - v2 * u1,
            u2 * v0 - u0 * v2,
            u0 * v1 - u1 * v0,
            )
    }
}

export class Point3d extends BaseVectorOrPoint {

    rotateX( origin, angle ) {
    }

    scale( origin= new Point3d(0, 0, 0), scale= 1. ) {
       let tempPoint = this.translate
    }

    distanceFromPoint ( point ) {
        return getVectorFromPoints(point, this).getLength()
    }

    copy ( vector ) {
        let matrixCopy = this.matrix.clone();
        matrixCopy.add( vector.matrix );
        return new Point3d( ...matrixCopy.matrix )
    }

}

export class Polyline {
    constructor( points ) {
        this.points = points;
    }
    flip() {
        this.points = this.points.reverse();
    }
    copyAndFlip() {
        return new Polyline([ ...this.points ]).flip()
    }
}

export class Line {
    constructor( start, end ) {
        this.start = start;
        this.end = end;
    }
    getLength() {
        return getVectorFromPoints( this.start, this.end ).getLength()
    }
    getMiddlePoint() {
        return getMiddlePoint([ this.start, this.end ])
    }
}

export class Mesh {
    constructor ( vertices, faces ) {
        this.vertices = vertices;
        this.faces = faces;
        this.faceNormals = this.getFaceNormals();
        this.vertexNormals = this.getVertexNormals();
    }
    getFacePoints ( faceIndex ) {
        const face = this.faces[ faceIndex ];
        return face.map( vertexIndex => this.vertices[ vertexIndex ] )
    }
    getFaceOutline ( faceIndex ) {
        const face = this.faces[ faceIndex ];
        let faceVertices = this.getFacePoints( faceIndex );
        faceVertices.push( faceVertices[0] );
        return new Polyline( faceVertices )
    }
    translate( vector3d ) {
        this.vertices.forEach( vertex => vertex.translate( vector3d ) );
    }
    getCentre() {
        return getMiddlePoint( this.vertices );
    }
    getEdges() {
        let meshEdges = [];
        this.faces.forEach( face => {
            let tempFace = [ ...face ];
            // to add the line from the last to the first face vertex
            tempFace.push( face[ 0 ] );
            for( let i = 0; i < tempFace.length - 1; i++ ) {
                let edgeVertices = [ tempFace[ i ], tempFace[ i + 1 ] ];
                edgeVertices.sort();
                if( !meshEdges.some( meshEdge => arraysAreEqual( meshEdge, edgeVertices) ) ) {
                    meshEdges.push( edgeVertices );
                }
            }
        })
        return meshEdges;
    }
    getFaceNormals() {
        let normals = [];
        for( let i = 0; i < this.faces.length; i++ ) {
            normals.push( getNormalFromThreePoints( ...this.getFacePoints( i ) ) );
        }
        return normals;
    }
    getVertexNormals() {
        let vertexNormals = [];
        for( let vertexIndex = 0; vertexIndex < this.vertices.length; vertexIndex++ ) {

            let facesWithVertex = this.getFacesWithVertexIndex( vertexIndex );
            let faceNormalsMatricesSum = new Matrix([ 0, 0, 0 ]);

            facesWithVertex.forEach( faceIndex => {
                let faceArea = this.getFaceArea( faceIndex );
                let faceNormalMatrix = this.faceNormals[ faceIndex ].matrix;
                faceNormalMatrix.multiplyByNumber( faceArea );
                faceNormalsMatricesSum.add( faceNormalMatrix );
            })

            vertexNormals.push( new Vector3d( ...faceNormalsMatricesSum.matrix ).getNormalised() )
        }
        return vertexNormals;
    }
    getFacesWithVertexIndex( vertexIndex ) {
        let faceIndices = [];
        this.faces.forEach ( ( face, faceIndex ) => {
            if( face.includes( vertexIndex ) ) {
                faceIndices.push(faceIndex);
            }
        });
        return faceIndices
    }
    getFaceArea( faceIndex ) {
        let faceVertices = this.getFacePoints( faceIndex );
        return getTriangleAreaFromVertices( ...faceVertices )
    }
    addMidEdgesSubdivisionVertices() {
        //NOTE: only works for triangular faces arranged counterclockwise
        this.getEdges().forEach( meshEdge => {

            this.vertices.push( getMiddlePoint( [
                this.vertices[ meshEdge[ 0 ] ],
                this.vertices[ meshEdge[ 1 ] ],
            ] ) );
        })
    }
    subdivideMidEdges( projectOntoSphere = true ) {
        let oldVertices = [ ...this.vertices ];
        this.addMidEdgesSubdivisionVertices();
        let newVertices = this.vertices.slice( oldVertices.length, this.vertices.length );

        let newFaces = [];
        this.faces.forEach( face => {

            let faceOutline = [ ...face ];

            faceOutline.push( face[ 0 ] );

            let subdivisionVerticesIndices = [];

            for( let i = 0; i < face.length; i++) {

                let point1Index = faceOutline[ i ];
                let point1 = this.vertices[ point1Index ];

                let point2Index = faceOutline[ i + 1 ];
                let point2 = this.vertices[ point2Index ];

                let tempMiddlePoint = getMiddlePoint( [ point1, point2 ] );
                subdivisionVerticesIndices.push( findVertexTwinIndex( this.vertices, tempMiddlePoint ) );

            }
            [
                [ face[ 0 ], subdivisionVerticesIndices[ 0 ], subdivisionVerticesIndices[ 2 ] ],
                [ subdivisionVerticesIndices[ 0 ], subdivisionVerticesIndices[ 1 ], subdivisionVerticesIndices[ 2 ] ],
                [ subdivisionVerticesIndices[ 0 ], face[ 1 ], subdivisionVerticesIndices[ 1 ] ],
                [ subdivisionVerticesIndices[ 2 ], subdivisionVerticesIndices[ 1 ], face[2] ],
            ].map( newFace => newFaces.push(newFace))
        })
        this.faces = newFaces;

        if( projectOntoSphere ) {
            let meshCentre = this.getCentre();
            let radius = getVectorFromPoints( meshCentre, this.vertices[ 0 ]).getLength();
            newVertices.forEach( newVertex => {
                let vectorFromCentre = getVectorFromPoints( meshCentre, newVertex).getNormalised();
                let vectorMatrix = vectorFromCentre.matrix;
                vectorMatrix.multiplyByNumber( radius );
                vectorFromCentre.updateCoordinates();
                newVertex.matrix = meshCentre.copy( vectorFromCentre ).matrix;
                newVertex.updateCoordinates();
            } )
        }
        this.updateNormals();
    }
    updateNormals() {
        this.faceNormals = this.getFaceNormals();
        this.vertexNormals = this.getVertexNormals();
    }
}

// UTILS
export function isIterable( objectToCheck ) {
    return Symbol.iterator in Object( objectToCheck );
}

export function setsAreEqual( setA, setB ) {
    return setA.size === setB.size && [ ...setA ].every( value => setB.has( value ) )
}

export function setDifference( setA, setB ) {
    return setA.filter( setAElem => !setB.has(setAElem) )
}

export function arraysAreEqual( arrayA, arrayB ) {
    return arrayA.length === arrayB.length && arrayA.every( ( value, vIndex) => value === arrayB[ vIndex ] );
}

export function getVectorFromPoints( pointA, pointB ) {
    return new Vector3d(
        pointB.x - pointA.x,
        pointB.y - pointA.y,
        pointB.z - pointA.z,
    )
}

export function getMiddlePoint( points3d ) {
    let middlePointMatrix = new Matrix([ 0, 0, 0 ]);

    points3d.forEach( point3d => {
        middlePointMatrix.add( point3d.matrix );
    } )
    middlePointMatrix.divideByNumber( points3d.length );
    return new Point3d( ...middlePointMatrix.matrix )
}

export function getBoundingBoxFromPoints( points3d ) {
    let minX = points3d[ 0 ].x;
    let maxX = points3d[ 0 ].x;
    let minY = points3d[ 0 ].y;
    let maxY = points3d[ 0 ].y;
    let minZ = points3d[ 0 ].z;
    let maxZ = points3d[ 0 ].z;

    if( points3d.length > 1 ) {

        for( let i = 1; i < points3d.length; i++ ) {

            let currentPoint = points3d[i];

            if( currentPoint.x < minX ) {
                minX = currentPoint.x;
            } else if( currentPoint.x > maxX ) {
                maxX = currentPoint.x;
            }

            if( currentPoint.y < minY ) {
                minY = currentPoint.y;
            } else if( currentPoint.y > maxY ) {
                maxY = currentPoint.y;
            }

            if( currentPoint.z < minZ ) {
                minZ = currentPoint.z;
            } else if( currentPoint.z > maxZ ) {
                maxZ = currentPoint.z;
            }
        }
    }
    return {
        min: new Point3d( minX, minY, minZ ),
        max: new Point3d( maxX, maxY, maxZ ),
    }
}

export function getTriangleAreaFromVertices( pointA, pointB, pointC ) {
    let vector1 = new Vector3d( ...pointB.matrix.getDifference( pointA.matrix ).matrix );
    let vector2 = new Vector3d( ...pointC.matrix.getDifference( pointA.matrix ).matrix );
    return vector1.crossProduct( vector2 ).getLength() / 2;
}

export function getNormalFromThreePoints( pointA, pointB, pointC, normalise=true ) {
    let vector1 = new Vector3d( ...pointB.matrix.getDifference( pointA.matrix ).matrix );
    let vector2 = new Vector3d( ...pointC.matrix.getDifference( pointA.matrix ).matrix );
    return vector1.crossProduct( vector2 ).getNormalised()
}

export function getCubeMesh( radius, origin = new Point3d() ) {
    const halfEdge = radius / Math.sqrt(3);
    let cubeVertices = [
        [ -halfEdge, -halfEdge, -halfEdge ], // 0
        [ halfEdge, -halfEdge, -halfEdge ], // 1
        [ halfEdge, -halfEdge, halfEdge ], // 2
        [ -halfEdge, -halfEdge, halfEdge ], // 3
        [ -halfEdge, halfEdge, -halfEdge ], // 4
        [ halfEdge, halfEdge, -halfEdge ], // 5
        [ halfEdge, halfEdge, halfEdge ], // 6
        [ -halfEdge, halfEdge, halfEdge ], // 7
    ].map( coordinates => new Point3d( ...coordinates ) );
    const cubeFaces = [
        [0, 3, 2, 1], // 0
        [0, 1, 5, 4], // 1
        [1, 2, 6, 5], // 2
        [2, 3, 7, 6], // 3
        [3, 0, 4, 7], // 4
        [4, 5, 6, 7], // 5
    ]
    let mesh = new Mesh( cubeVertices, cubeFaces );
    mesh.translate( new Vector3d( ...origin.matrix.matrix ) );
    return mesh
}

export function getTetrahedronMesh( radius, origin= new Point3d() ) {
    const halfCubeEdge = radius / Math.sqrt(3);
    const tetrahedronVertices = [
        [ -halfCubeEdge, -halfCubeEdge, -halfCubeEdge],
        [ halfCubeEdge, -halfCubeEdge, halfCubeEdge],
        [ halfCubeEdge, halfCubeEdge, -halfCubeEdge],
        [ -halfCubeEdge, halfCubeEdge, halfCubeEdge],
    ].map( coordinates => new Point3d( ...coordinates ) );
    const tetrahedronFaces = [
        [0, 1, 2],
        [1, 3, 2],
        [1, 0, 3],
        [0, 2, 3],
    ];
    let mesh = new Mesh( tetrahedronVertices, tetrahedronFaces );
    mesh.translate( new Vector3d( ...origin.matrix.matrix ) );
    return mesh
}

export function getOctahedronMesh( radius, origin = new Point3d() ) {
    const octahedronVertices = [
        [ 0, 0, radius ],
        [ -radius, 0, 0 ],
        [ 0, -radius, 0 ],
        [ radius, 0, 0 ],
        [ 0, radius, 0 ],
        [ 0, 0, -radius ],
    ].map( coordinates => new Point3d( ...coordinates ) );
    const octahedronFaces = [
        [ 1, 2, 0 ],
        [ 2, 3, 0 ],
        [ 3, 4, 0 ],
        [ 4, 1, 0 ],
        [ 2, 1, 5 ],
        [ 3, 2, 5 ],
        [ 4, 3, 5 ],
        [ 1, 4, 5 ],
    ];
    let mesh = new Mesh( octahedronVertices, octahedronFaces );
    mesh.translate( new Vector3d( ...origin.matrix.matrix ) );
    return mesh
}

export function getIcosahedronMesh( radius, origin = new Point3d() ) {
    // (0, ±1, ±ϕ)
    // (±1, ±ϕ, 0)
    // (±ϕ, 0, ±1)

    const phi = ( 1 + Math.sqrt(5)) / 2.;
    const scale = radius / getVectorFromPoints( new Point3d(0, 0, 0), new Point3d(0, 1, phi)).getLength();

    const icosahedronVertices = [
        [ -scale, phi * scale, 0 ],
        [ scale, phi * scale, 0 ],
        [ -scale, -phi * scale, 0 ],
        [ scale, -phi * scale, 0 ],
        [ 0, -scale, phi * scale ],
        [ 0, scale, phi * scale ],
        [ 0, -scale, -phi * scale ],
        [ 0, scale, -phi * scale ],
        [ phi * scale, 0, -scale ],
        [ phi * scale, 0, scale ],
        [ -phi * scale, 0, -scale ],
        [ -phi * scale, 0, scale ],
    ].map( coordinates => new Point3d( ...coordinates ) );

    let icosahedronFaces = [
        [ 0, 11, 5 ],
        [ 0, 5, 1 ],
        [ 0, 1, 7 ],
        [ 0, 7, 10 ],
        [ 0, 10, 11 ],
        [ 1, 5, 9 ],
        [ 5, 11, 4 ],
        [ 11, 10, 2 ],
        [ 10, 7, 6 ],
        [ 7, 1, 8 ],
        [ 3, 9, 4 ],
        [ 3, 4, 2 ],
        [ 3, 2, 6 ],
        [ 3, 6, 8 ],
        [ 3, 8, 9 ],
        [ 4, 9, 5 ],
        [ 2, 4, 11 ],
        [ 6, 2, 10 ],
        [ 8, 6, 7 ],
        [ 9, 8, 1 ],
    ];
    let mesh = new Mesh( icosahedronVertices, icosahedronFaces );
    mesh.translate( new Vector3d( ...origin.matrix.matrix ) );
    return mesh
}

export function getMeshEdgesByFaceIndex( faceIndex, meshEdges = undefined ) {
    if( meshEdges === undefined ) {

    }
}

export function findVertexTwinIndex( vertices, point ) {
    for( let i = 0; i < vertices.length; i++ ) {
        if( arraysAreEqual( vertices[ i ].matrix.matrix, point.matrix.matrix ) ) {
            return i
        }
    }
    throw "Point not found in the vertices list"
}

export function getGeodesicDomeMesh( mesh, radius, origin = new Point3d(), iterations = 1 ) {
    //NOTE: only works with meshes with exclusively triangular faces
    if( iterations > 0 ) {
        for( let i = 1; i <= iterations; i++ ) {
            mesh.subdivideMidEdges();
        }
    }
    mesh.translate( new Vector3d( ...origin.matrix.matrix ) );
    return mesh
}

export function getSpikyMesh( mesh, spikesRadius, origin = new Point3d(), iterations = 1 ) {
    // adds a new point in the middle of each face and offsets it to [spikesRadius] from the mesh centre

    for( let i = 0; i < iterations; i++ ) {

        let newVertices = [ ...mesh.vertices ];
        let newFaces = [];
        const meshCentre = mesh.getCentre();

        let currentVertexIndex = newVertices.length;

        mesh.faces.forEach( ( face, faceIndex ) => {

            let facePoints = mesh.getFacePoints( faceIndex );
            let faceCentre = getMiddlePoint( facePoints );

            let newVertexVector = getVectorFromPoints( meshCentre, faceCentre ).getNormalised().getScaled( spikesRadius );
            //TODO: deal with the calculation inaccuracy due to variable format
            // (radius 250 vs new vector length 250.00000000000003)

            let newVertex = meshCentre.copy( newVertexVector );
            let faceVerticesCount = facePoints.length;

            newVertices.push( newVertex );

            for( let i = 0; i < faceVerticesCount - 1; i++ ) {
                newFaces.push( [
                    face[ i ], // current face vertex index
                    face[ i + 1 ], // next face vertex index
                    newVertices.length - 1, //the new vertex index
                ] )
                currentVertexIndex += 1;
            }
            newFaces.push( [
                face[ face.length - 1 ],
                face[ 0 ],
                newVertices.length - 1,
            ] )
        })
        mesh = new Mesh( newVertices, newFaces );
    }
    mesh.translate( new Vector3d( ...origin.matrix.matrix ) );
    return mesh
}
