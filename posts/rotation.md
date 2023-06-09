---
title: "Game Engine Tutorial Series Part 4: Rotation"
excerpt: "In this part we will fix the problems with our world being rendered upside down, discuss rotations and implement the required data structures for rigid body physics"
coverImage: "/Rotation/rotation-cover.jpg"
date: "2023-05-28T04:00:00.000Z"
author: Arman Matinyan
ogImage: "/Rotation/rotation-og.jpg"
readTime: "45 min"
previousSlug: "collisions"
previousTitle: "Part 3: Collisions"
---

So far we have been exploring physics in regard to particles, but having objects with neither volume nor rotation limits
the game design that we can accomplish. Other than that, our character seems to float up instead of falling down due to
gravity. In this part we will fix the problems with our world being rendered upside down, discuss rotations and implement
the required data structures for rigid body physics.

The source code is available on GitHub at [https://github.com/Snowblaze-Studio/game-engine](https://github.com/Snowblaze-Studio/game-engine).
The final code for this part of the tutorial can be found under the tag "part-4-rotation".

## World Rendering

For our world rendering we have been using the SDL library. Its coordinate system is defined with the X axis pointing to the right,
the Y axis pointing down, and with the origin in the top left. It would be more convenient if the Y axis pointed up, but as we have
just one character (object) in the game, we'll resort to a temporary solution: calculating our character's position in SDL's
coordinate system.

To begin with, let's add constant values for the window's width and height in *Game.hpp*:

```cpp
class Game
{
public:
	const static float WINDOW_WIDTH;
	const static float WINDOW_HEIGHT;
	
	// Other code here...
}
```

Initialize them in *Game.cpp*:

```cpp
const float Game::WINDOW_WIDTH = 1024.0f;
const float Game::WINDOW_HEIGHT = 728.0f;
```

Replace all the hardcoded occurrences of width and height in *Game.cpp*:

```cpp
bool Game::Initialize()
{
    // Other code here...

	// Create the window
	mWindow = SDL_CreateWindow("Game Engine", 100, 100, WINDOW_WIDTH, WINDOW_HEIGHT, 0);
	
    // Other code here...

	mCharacter = new Particle();

	float x = WINDOW_WIDTH / 2.0f;
	float y = WINDOW_HEIGHT / 2.0f;
    
    // Other code here...
}
```

What is left to change is the actual calculation for rendering:

```cpp
void Game::GenerateOutput()
{
    // Other code here...
    
    SDL_Rect character = {
		static_cast<int>(WINDOW_WIDTH - (currentPosition.x + 50)),
		static_cast<int>(WINDOW_HEIGHT - (currentPosition.y + 50)),
		100,
		100,
	};
	
	// Other code here...
}
```

**Note**: this is a temporary solution, which we'll replace in the upcoming parts of the series.

## Rotations in 2D

Most games require some form of rotation, be it in all three axes or any number of them. It gives us the ability to orient
the objects in a game, or, for example, make the collisions more realistic by adding circular motion to the collided objects.

There are multiple approaches of representing the object's rotation in 2D:
- angle in degrees/radians
- vector
- matrix

If we measure the rotation in degrees/radians, we can have problems with multiple values representing the same rotation.
To solve that, we can define a range of values and whenever our rotation is outside this range, bring it back in. So, for
example, to represent the rotation in radians our range will be $(-\pi$, $\pi]$, and a rotation of $2\pi$ will be transformed
into $0$. Same logic applies to rotations in degrees. This way of dealing with rotations sometimes requires messy code.

Another way we can represent that same value is with a two-element vector. We can express the rotation
with trigonometric functions:

$$
\begin{bmatrix}
cos\theta \\
sin\theta
\end{bmatrix}
$$

where $\theta$ is the angular representation of the rotation. This form helps us reduce special case code and bounds checking.
And if we use only unit vectors it will be way easier to perform mathematical operations. This constraint is satisfied by
simply normalizing the vector.

Before we explore the matrix representation, let's talk about what our position and rotation actually represent. Until now,
we have dealt only with particles, which exist at a single point in space. If, say, our objects are larger than a point,
what does the position represent now? As the object is at many locations at the same time, let's define its position as
its **origin**. That way we can determine where every bit of the object is relative to the origin.

Let's imagine the coordinate system from an object's point of view, a.k.a. **object space**.

![Relative Position](/Rotation/origin.svg)

In object space, origin of the object is exactly at

$$
\begin{bmatrix} 0 \\ 0 \end{bmatrix}
$$

Top right corner of the object, relative to the origin, is at

$$
\begin{bmatrix} 1 \\ 2 \end{bmatrix}
$$

If we move the object's origin, so will the top right corner

![Translation](/Rotation/translated.svg)

Now the object is at

$$
\begin{bmatrix} 2 \\ 3 \end{bmatrix}
$$

relative to the world origin, and as we know the relative position of the top right corner, we can calculate its position
in **world space** (world position)

$$
\begin{bmatrix} 2 \\ 3 \end{bmatrix}
+
\begin{bmatrix} 1 \\ 2 \end{bmatrix}
=
\begin{bmatrix} 3 \\ 5 \end{bmatrix}
$$

This movement is called **translation**.

How should we deal with rotated objects? To calculate the new position of the top right corner after rotating the object
we will use a so-called **rotation matrix**. It is the third way of representing a rotation in 2D.

$$
\Theta = \begin{bmatrix} cos\theta & -sin\theta \\ sin\theta & cos\theta \end{bmatrix}
$$

where positive $\theta$ means counterclockwise rotation, and negative means clockwise rotation.

In the following example we have the object rotated by -50 degrees and translated by 2 units in X direction and
by 3 units in Y direction.

![Rotation](/Rotation/rotated.svg)

First let's calculate the rotated relative position by multiplying the rotation matrix and the relative position

$$
a_o' = \begin{bmatrix} cos\theta & -sin\theta \\ sin\theta & cos\theta \end{bmatrix} a_o
$$

where $a_o$ is the position in object space. After substituting $\theta$ and $a_o$, we get

$$
a_o'
=
\begin{bmatrix} 0.64 & 0.76 \\ -0.76 & 0.64 \end{bmatrix}
\begin{bmatrix} 1 \\ 2 \end{bmatrix}
=
\begin{bmatrix} 2.17 \\ 0.52 \end{bmatrix}
$$

Then we apply the object's translation to get the world position of the top right corner

$$
\begin{bmatrix} 2.17 \\ 0.52 \end{bmatrix}
+
\begin{bmatrix} 2 \\ 3 \end{bmatrix}
=
\begin{bmatrix} 4.17 \\ 3.52 \end{bmatrix}
$$

This calculation is called **transformation** and was done in the following way

$$
a_w = \Theta a_o + p
$$

where $a_w$ is the position in world space and $p$ is the position of the object.

In a sense, we can choose any point to be the origin of the object, but to simplify the mathematics we can use a point that
exists for every object - **the center of mass**. If we picture the object made up of millions of particles, center of mass
is their average position, where each particle's mass is taken into account.

$$
p_c = \frac{1}{m}\sum_n m_i p_i
$$

where $p_c$ is the center of mass, $m$ is the mass of the object, $m_i$ and $p_i$ are the mass and the position of particle $i$,
respectively. Using the center of mass as the origin of an object, we can separate the calculations for linear and angular motion.

## Moving to 3D

In 3D there have been multiple attempts to create a good orientation representation, obvious and not so much. To list a few:
- Euler angles
- Axis-angle
- Rotation matrices
- Quaternion

Euler angles use a vector to represent the rotation, where each component is the amount of rotation about the corresponding axis.
We will need 3 angles, one for each axis. It may seem an obvious representation, but it has a great flaw. How do we combine the
angles? In what order do we apply them? Depending on the order, the result may differ. For example, imagine some arbitrary object,
like a plane, first rotate it around its X axis by some amount, then around its Y axis. Now do the same but in reverse. The object
will have different orientations.

You may think that's because we operated with its local axes. Try with fixed (world) axes this time. You will get the same problem
and to top it off, another issue occurs - gimbal lock.

Let's assume that we are applying rotations in X -> Y -> Z order (world axes). If we skip X rotation (0 degrees) and rotate 90 degrees
around Y axis, the object will now point in the negative X direction. Say we want the object to rotate around its local Z axis
(which is aligned with the X axis), but unfortunately we can't do that with this particular order of rotations, as we have already
passed the X rotation step. If we had Z -> Y -> X order, then we would definitely get what we wanted. As you can imagine every order
has its own edge cases and although there are solutions to this problem, we would require just horrible boundary conditions,
very arbitrary mathematics and it would cause a great deal of headache. When one axis gets aligned with another, and we lose a degree
of freedom, that is what is called a **gimbal lock**. Fortunately, there are better ways to represent a rotation.

We can get any orientation using just an axis and an angle, hence the name **axis-angle** representation. It is somewhat similar to the
angle representation that we talked about in 2D and has similar problems of bound checking. Another representation using axis and angle
is the **scaled axis representation**. If we normalize the axis, we can store the angle as its magnitude. This is the most compact version.
The problem is that the calculations aren't simple, as it is unclear how to combine rotations easily.

A clean solution to the problem of combining rotations are **rotation matrices**. The mathematics are rather simple to implement as well.
The matrix looks like the following:

$$
\Theta = \begin{bmatrix} tx^2 + c & txy + sz & txz - sy \\ txy - sz & ty^2 + c & tyz + sx \\ txz + sy & tyz - sx & tz^2 + x \end{bmatrix}
$$

where

$$
\begin{bmatrix} x \\ y \\ z \end{bmatrix}
$$

is the axis of rotation, $c = cos\theta$, $s = sin\theta$, $t = 1 - cos\theta$, and $\theta$ is the angle.

Using sine and cosine of the angle frees us from bounds checking of the angle and combining two rotations is just multiplying two
matrices together. As simple as that. The disadvantage of this representation is numerous computations that had to be done to
ensure the rotation is accurate. Although it's workable, it is less practical than we'd like.

The last, the best and most widely used representation is called **quaternion**. Quaternion is a four element vector, whose values
relate to the axis and angle of the rotation in the following way:

$$
\begin{bmatrix}
xsin\frac{\theta}{2} \\[0.2em]
ysin\frac{\theta}{2} \\[0.2em]
zsin\frac{\theta}{2} \\[0.2em]
cos\frac{\theta}{2}
\end{bmatrix}
$$

where

$$
\begin{bmatrix} x \\ y \\ z \end{bmatrix}
$$

is the axis, and $\theta$ is the angle. If the axis is of unit-length, then the quaternion should be of unit-length as well. And this is
a requirement for quaternions to represent rotations.

Even though this is the usual form a quaternion is written in, that is merely the short version. A quaternion can be interpreted as a
four-dimensional complex number, with a single real axis and three imaginary axes, represented by imaginary numbers $i$, $j$ and $k$.
Its complex form looks like this

$$
\theta = xi + yj + zk + w
$$

where $x$, $y$, $z$ and $w$ are real numbers, while $i$, $j$ and $k$ are all different imaginary numbers. William Rowan Hamilton
(inventor of the quaternion) established the following rules

$$
\begin{matrix}
i^2 = j^2 = k^2 = -1 \\[0.3em]
ij = -ij = k \\[0.3em]
jk = -kj = i \\[0.3em]
ki = -ik = j
\end{matrix}
$$

With these rules we can combine two quaternions $\theta_1 = x_1i + y_1j + z_1k + w_1$ and $\theta_2 = x_2i + y_2j + z_2k + w_2$ by
multiplication

$$
\begin{split}
\theta_1\theta_2 &= (x_1w_2 + y_1z_2 - z_1y_2 + w_1x_2)i \\
       &+ (y_1w_2 + z_1x_2 + w_1y_2 - x_1z_2)j \\
       &+ (z_1w_2 + w_1z_2 + x_1y_2 - y_1x_2)k \\
       &+ (w_1w_2 - x_1x_2 - y_1y_2 - z_1z_2)
\end{split}
$$

The product represents two rotations combined.

An important thing to mention regarding quaternion multiplication is that it isn't commutative. As stated in the rules above,
reversing the order in which two imaginary units are multiplied negates their product.

We figured out how to represent orientations, but what makes them change? How fast does the rotation occur and in what direction?

## Angular Velocity and Acceleration

The property responsible for the speed and direction of rotation is called **angular velocity**. In 2D it is pretty straightforward:
we can use a single scalar value without bound checking, as the speed of rotation has no limit. For 3D rotations we will be using
the scaled axis representation. This way we still won't need to check for bounds. The angular velocity is represented by a three-element
vector and can be decomposed into

$$
\dot{\theta} = ra
$$

where $a$ is the axis around which the object is rotating, and $r$ is the rate of rotation.

Using vector arithmetics we can add two angular velocities together, which gets us a new and correct angular velocity.

Other than combining velocities, we need to update the orientation of the object every frame. For position update we have
used the linear velocity, which is the first derivative of the position with respect to time. Similarly, for orientation
update we can use its first derivative with respect to time, which is the angular velocity.

$$
\theta' = \theta + \frac{\Delta{t}}{2}\omega\theta
$$

where $\omega$ is a quaternion constructed from the angular velocity.

$$
\omega = \begin{bmatrix} \dot{\theta}_x \\ \dot{\theta}_y \\ \dot{\theta}_z \\ 0 \end{bmatrix}
$$

The first three components are taken directly from the angular velocity and the last one equals to $0$. This quaternion doesn't
represent an orientation, so it shouldn't be normalized.

As for the angular acceleration, we can store it using the same vector representation as for the angular velocity. And to update it

$$
\dot{\theta}' = \dot{\theta} + \ddot{\theta}t
$$

where $\ddot{\theta}$ is the angular acceleration, and $\dot{\theta}$ is the angular velocity.

Another useful thing we should discuss is the velocity of a point on an object. It depends on both linear and angular velocities:

$$
\dot{q} = \dot{\theta} \times (q - p) + \dot{p}
$$

where $\dot{q}$ is the velocity of the point, cross ($\times$) is the cross product, $q$ is the position of the point in world space,
$p$ is the origin of the object, and $\dot{\theta}$ is the angular velocity of the object. This property will be used in the next part
of the series.

## 3D Calculations

Before we start implementing all that was discussed, we should probably pay a visit to our *Vector2* class and refactor it for 3D.

To add the third dimension, we need to do the following changes in *core.hpp*:

```cpp
#pragma once

#ifndef CORE_HPP // include guard
#define CORE_HPP

class Vector3
{
public:
    float x;
    float y;
    float z;

public:
    Vector3() : x(0), y(0), z(0) {}

    Vector3(const float x, const float y, const float z) : x(x), y(y), z(z) {}

    const static Vector3 GRAVITY;
    const static Vector3 UP;

    void clear()
    {
        x = y = z = 0;
    }

    void invert()
    {
        x = -x;
        y = -y;
        z = -z;
    }

    void addScaledVector(const Vector3& vector, float scale)
    {
        x += vector.x * scale;
        y += vector.y * scale;
        z += vector.z * scale;
    }

    void operator+=(const Vector3& vector)
    {
        x += vector.x;
        y += vector.y;
        z += vector.z;
    }

    Vector3 operator+(const Vector3& vector) const
    {
        return Vector3(x + vector.x, y + vector.y, z + vector.z);
    }

    void operator-=(const Vector3& vector)
    {
        x -= vector.x;
        y -= vector.y;
        z -= vector.z;
    }

    Vector3 operator-(const Vector3& vector) const
    {
        return Vector3(x - vector.x, y - vector.y, z - vector.z);
    }

    void operator*=(const float value)
    {
        x *= value;
        y *= value;
        z *= value;
    }

    Vector3 operator*(const float value) const
    {
        return Vector3(x * value, y * value, z * value);
    }

    float operator*(const Vector3& vector) const
    {
        return x * vector.x + y * vector.y + z * vector.z;
    }
};

#endif
```

And in *cope.cpp* respectively:

```cpp
#include "include/core.hpp"

const Vector3 Vector3::GRAVITY = Vector3(0, -9.81f, 0);
const Vector3 Vector3::UP = Vector3(0, 1.0f, 0);
```

Change all the occurrences of *Vector2* to *Vector3* in *groundcontact.cpp*, *pcontact.cpp* and *pcontact.hpp*. Update *Particle* class
in *particle.hpp* to work with *Vector3* like so

```cpp
#pragma once

#ifndef PARTICLE_HPP // include guard
#define PARTICLE_HPP

#include "core.hpp"
#include <assert.h>
#include <corecrt_math.h>

class Particle
{
protected:
    // Holds the position of the particle in world space
    Vector3 position;

    // Holds the linear velocity of the particle in world space
    Vector3 velocity;

    // Holds the acceleration of the particle
    Vector3 acceleration;

    float damping;

    float inverseMass;

public:
    void setDamping(const float value)
    {
        damping = value;
    }

    float getDamping() const
    {
        return damping;
    }

    void getAcceleration(Vector3* accPtr) const
    {
        *accPtr = acceleration;
    }

    Vector3 getAcceleration() const
    {
        return acceleration;
    }

    void setAcceleration(const Vector3& value)
    {
        acceleration = value;
    }

    void setAcceleration(const float x, const float y, const float z)
    {
        acceleration.x = x;
        acceleration.y = y;
        acceleration.z = z;
    }

    void setMass(const float value)
    {
        inverseMass = 1.0f / value;
    }

    float getInverseMass() const
    {
        return inverseMass;
    }

    void setInverseMass(const float value)
    {
        inverseMass = value;
    }

    void setPosition(const Vector3& value)
    {
        position = value;
    }

    void setPosition(const float x, const float y, const float z)
    {
        position.x = x;
        position.y = y;
        position.z = z;
    }

    void setVelocity(const Vector3& velPtr)
    {
        velocity = velPtr;
    }

    void setVelocity(const float x, const float y, const float z)
    {
        velocity.x = x;
        velocity.y = y;
        velocity.z = z;
    }

    void getVelocity(Vector3* velPtr) const
    {
        *velPtr = velocity;
    }

    Vector3 getVelocity() const
    {
        return velocity;
    }

    void getPosition(Vector3* positionPtr) const
    {
        *positionPtr = position;
    }

    Vector3 getPosition() const
    {
        return position;
    }

    void integrate(float deltaTime)
    {
        // Skip integrating objects with infinite mass
        if (inverseMass <= 0.0f) return;

        assert(deltaTime > 0.0f);

        // Update position
        position.addScaledVector(velocity, deltaTime);

        Vector3 resultingAcceleration = acceleration;

        // Update velocity
        velocity.addScaledVector(resultingAcceleration, deltaTime);

        // Impose drag
        velocity *= powf(damping, deltaTime);
    }
};

#endif
```

The only part that is left to update is in *Game.cpp*.

```cpp
bool Game::Initialize()
{
    // Other code here...
    
    float x = WINDOW_WIDTH / 2.0f;
	float y = WINDOW_HEIGHT / 2.0f;
	float z = 0.0f;

	mCharacter->setPosition(x, y, z);
	mCharacter->setMass(1.0);
	mCharacter->setAcceleration(Vector3::GRAVITY);
	mCharacter->setDamping(0.99);
	
	// Other code here...
}

void Game::GenerateOutput()
{
    // Other code here...

	// Draw the character
	Vector3 currentPosition = mCharacter->getPosition();

    // Other code here...
}
```

To implement rotations, we will need matrix and quaternion mathematics. A matrix is a 2-dimensional array of scalar values. It can be
of any size, but in our implementation we will be using 3-by-3 and 3-by-4 matrices. Why 3-by-4? Just to skip some redundant computation,
that we would do if we used a 4-by-4 matrix. Let's create *Matrix3x3* and *Matrix3x4* classes respectively. In *core.hpp* add the following data
structures:

```cpp
// Other code here...

class Matrix3x3
{
public:
    float data[9];

    Matrix3x3()
    {
        data[0] = 0;
        data[1] = 0;
        data[2] = 0;
        data[3] = 0;
        data[4] = 0;
        data[5] = 0;
        data[6] = 0;
        data[7] = 0;
        data[8] = 0;
    }

    Matrix3x3(const Vector3& column0, const Vector3& column1, const Vector3& column2)
    {
        data[0] = column0.x;
        data[1] = column1.x;
        data[2] = column2.x;
        data[3] = column0.y;
        data[4] = column1.y;
        data[5] = column2.y;
        data[6] = column0.z;
        data[7] = column1.z;
        data[8] = column2.z;
    }

    Matrix3x3(float c0, float c1, float c2, float c3, float c4, float c5, float c6, float c7, float c8)
    {
        data[0] = c0;
        data[1] = c1;
        data[2] = c2;
        data[3] = c3;
        data[4] = c4;
        data[5] = c5;
        data[6] = c6;
        data[7] = c7;
        data[8] = c8;
    }
};

class Matrix3x4
{
public:
    float data[12];

    Matrix3x4()
    {
        data[0] = 1;
        data[1] = 0;
        data[2] = 0;
        data[3] = 0;
        data[4] = 0;
        data[5] = 1;
        data[6] = 0;
        data[7] = 0;
        data[8] = 0;
        data[9] = 0;
        data[10] = 1;
        data[11] = 0;
    }

    Matrix3x4(float c0, float c1, float c2, float c3, float c4, float c5, float c6, float c7, float c8, float c9, float c10, float c11)
    {
        data[0] = c0;
        data[1] = c1;
        data[2] = c2;
        data[3] = c3;
        data[4] = c4;
        data[5] = c5;
        data[6] = c6;
        data[7] = c7;
        data[8] = c8;
        data[9] = c9;
        data[10] = c10;
        data[11] = c11;
    }
};
```

### Multiplication

Matrices are used to represent transformations in 3D space. They can be used to represent rotations, translations, scaling, shearing, etc.
By multiplying a vector by a matrix, we can transform it:

$$
v' = Mv
$$

Why does the vector come after the matrix? There is a rule for multiplying matrices. The number of columns in the first matrix must be equal
to the number of rows in the second matrix. The result is a new matrix with the same number of rows as in the first matrix and the same number
of columns as in the second one. So if we think of a vector as a 3-by-1 matrix, then we can multiply a 3-by-3 matrix by a 3-by-1
matrix and get a 3-by-1 matrix, which is our transformed vector.

The formula for multiplying two matrices is:

$$
C_{ij} = \sum_{k=1}^{n} A_{ik}B_{kj}
$$

where $A$ is the first matrix, $B$ is the second matrix, $C$ is the resulting matrix, $n$ is the number of columns in $A$ and the
number of rows in $B$, $i$ is the row index and $j$ is the column index.

So for multiplying a 3-by-3 matrix by a 3-by-1 matrix we get:

$$
\begin{bmatrix}
    a & b & c \\
    d & e & f \\
    g & h & i
\end{bmatrix}
\begin{bmatrix}
    x \\
    y \\
    z
\end{bmatrix}
=
\begin{bmatrix}
ax + by + cz \\
dx + ey + fz \\
ga + hy + iz
\end{bmatrix}
$$

Let's implement this in code:

```cpp
class Matrix3x3
{
    // Other code here...

    Vector3 operator*(const Vector3& vector) const
    {
        return Vector3(
            vector.x * data[0] + vector.y * data[1] + vector.z * data[2],
            vector.x * data[3] + vector.y * data[4] + vector.z * data[5],
            vector.x * data[6] + vector.y * data[7] + vector.z * data[8]
        );
    }

    Vector3 transform(const Vector3& vector) const
    {
        return (*this) * vector;
    }
}
```

Before adding multiplication for 3-by-4 matrices, I'd like to talk about matrices as transformations. A 3-by-3 matrix can represent
rotation, scaling, shearing or any combination of them. If we think of a matrix being made up of three column vectors, then each column
vector represents the direction of the corresponding axis after the transformation. For example, if we have a vector pointing along X axis

$$
\begin{bmatrix}
    1 \\
    0 \\
    0
\end{bmatrix}
$$

and we multiply it by a matrix

$$
\begin{bmatrix}
    a & b & c \\
    d & e & f \\
    g & h & i
\end{bmatrix}
$$

then we get a new vector

$$
\begin{bmatrix}
    a \\
    d \\
    g
\end{bmatrix}
$$

which is the direction of the X axis after the transformation. The same goes for the Y and Z axes. So the matrix can be thought of as a
transformation of the coordinate system (change of basis). The origin of the new coordinate system is the origin of the old coordinate system, because 3-by-3
matrices can't represent translation, so the origin stays at the same place. To add the opportunity to translate the origin, we can use 3-by-4
matrices. The fourth column vector represents the translation of the origin. As you may have noticed, we can't multiply 3-by-4 matrix by a
3-by-1 vector. That would break the multiplication rules. We need our vector to be 4-by-1. So we can think of it as such and substitute the
fourth element with 1.

$$
\begin{bmatrix}
    x \\
    y \\
    z \\
    1
\end{bmatrix}
$$

This is called **homogeneous coordinates**. They are mainly used in graphics programming and are a topic for a different time. So now we can
multiply a 3-by-4 matrix by a 4-by-1 vector and get a 3-by-1 vector, which is our transformed vector. The formula for multiplying a 3-by-4
matrix by a 4-by-1 vector is:

$$
\begin{bmatrix}
    a & b & c & d \\
    e & f & g & h \\
    i & j & k & l
\end{bmatrix}
\begin{bmatrix}
    x \\
    y \\
    z \\
    1
\end{bmatrix}
=
\begin{bmatrix} 
    ax + by + cz + d \\
    ex + fy + gz + h \\
    ix + jy + kz + l
\end{bmatrix}
$$

With this we can do all the transformations at the same time. First three columns represent the direction of the X, Y and Z axes after
the transformation and the fourth column represents the translation of the origin. In code it looks like this:

```cpp
class Matrix3x4
{
    // Other code here...
    
    Vector3 operator*(const Vector3& vector) const
    {
        return Vector3(
            vector.x * data[0] + vector.y * data[1] + vector.z * data[2] + data[3],
            vector.x * data[4] + vector.y * data[5] + vector.z * data[6] + data[7],
            vector.x * data[8] + vector.y * data[9] + vector.z * data[10] + data[11]
        );
    }

    Vector3 transform(const Vector3& vector) const
    {
        return (*this) * vector;
    }
}
```

What if we have multiple transformation matrices and we want to apply them all at once? We can combine their effects by multiplying
them together. The order of the transformation is the opposite of the order of multiplication. If we have matrices $A$ and $B$,
then the matrix $AB$ represents the transformation that is the same as first applying $B$ and then applying $A$. Let's implement this:

```cpp
class Matrix3x3
{
    // Other code here...
    
    Matrix3x3 operator*(const Matrix3x3& o) const
    {
        return Matrix3x3(
            data[0] * o.data[0] + data[1] * o.data[3] + data[2] * o.data[6],
            data[0] * o.data[1] + data[1] * o.data[4] + data[2] * o.data[7],
            data[0] * o.data[2] + data[1] * o.data[5] + data[2] * o.data[8],
            data[3] * o.data[0] + data[4] * o.data[3] + data[5] * o.data[6],
            data[3] * o.data[1] + data[4] * o.data[4] + data[5] * o.data[7],
            data[3] * o.data[2] + data[4] * o.data[5] + data[5] * o.data[8],
            data[6] * o.data[0] + data[7] * o.data[3] + data[8] * o.data[6],
            data[6] * o.data[1] + data[7] * o.data[4] + data[8] * o.data[7],
            data[6] * o.data[2] + data[7] * o.data[5] + data[8] * o.data[8]
        );
    }

    void operator*=(const Matrix3x3& o)
    {
        *this = *this * o;
    }
}
```

To multiply two 3-by-4 matrices, we substitute the fourth row with $(0, 0, 0, 1)$ to get 4-by-4 matrices.

$$
\begin{bmatrix}
    a & b & c & d \\
    e & f & g & h \\
    i & j & k & l \\
    0 & 0 & 0 & 1
\end{bmatrix}
$$

The resulting matrix will also have the fourth row equal to $(0, 0, 0, 1)$, so we can discard it.

Code for multiplying two 3-by-4 matrices:

```cpp
class Matrix3x4
{
    // Other code here...
    
    Matrix3x4 operator*(const Matrix3x4& o) const
    {
        return Matrix3x4(
            data[0] * o.data[0] + data[1] * o.data[4] + data[2] * o.data[8],
            data[0] * o.data[1] + data[1] * o.data[5] + data[2] * o.data[9],
            data[0] * o.data[2] + data[1] * o.data[6] + data[2] * o.data[10],
            data[0] * o.data[3] + data[1] * o.data[7] + data[2] * o.data[11] + data[3],
            data[4] * o.data[0] + data[5] * o.data[4] + data[6] * o.data[8],
            data[4] * o.data[1] + data[5] * o.data[5] + data[6] * o.data[9],
            data[4] * o.data[2] + data[5] * o.data[6] + data[6] * o.data[10],
            data[4] * o.data[3] + data[5] * o.data[7] + data[6] * o.data[11] + data[7],
            data[8] * o.data[0] + data[9] * o.data[4] + data[10] * o.data[8],
            data[8] * o.data[1] + data[9] * o.data[5] + data[10] * o.data[9],
            data[8] * o.data[2] + data[9] * o.data[6] + data[10] * o.data[10],
            data[8] * o.data[3] + data[9] * o.data[7] + data[10] * o.data[11] + data[11]
        );  
    }
}
```

### Inverse Matrix

If we have matrices that transform from one coordinate system to another, it will be useful to be able to reverse the transformation.
The matrix that reverses the transformation of a matrix $M$ is called the **inverse** of $M$ and is denoted by $M^{-1}$.
If we combine a matrix and its inverse we get the **identity matrix** $I$, which does no transformations. So if we transform a vector
by some matrix and then again by its inverse, we get the original vector.

$$
M^{-1}M = I
$$

Calculating the inverse of a 3-by-3 matrix is quite straightforward.

$$
M
=
\begin{bmatrix}
    a & b & c \\
    d & e & f \\
    g & h & i
\end{bmatrix}
$$

$$
M^{-1}
=
\frac{1}{det(M)}
\begin{bmatrix}
    ei - fh & ch - bi & bf - ce \\
    fg - di & ai - cg & cd - af \\
    dh - eg & bg - ah & ae - bd
\end{bmatrix}
$$

where $det(M)$ is the determinant of $M$. The determinant of a 3-by-3 matrix is calculated as follows:

$$
det(M) = a(ei - fh) - b(di - fg) + c(dh - eg)
$$

You could have noticed that the inverse exists only if the determinant is non-zero. Let's get to the code:

```cpp
class Matrix3x3
{
    // Other code here...
    
    void setInverse(const Matrix3x3& m)
    {
        float t4 = m.data[0] * m.data[4];
        float t6 = m.data[0] * m.data[5];
        float t8 = m.data[1] * m.data[3];
        float t10 = m.data[2] * m.data[3];
        float t12 = m.data[1] * m.data[6];
        float t14 = m.data[2] * m.data[6];
        // Calculate the determinant
        float t16 = (t4 * m.data[8] - t6 * m.data[7] - t8 * m.data[8] +
                       t10 * m.data[7] + t12 * m.data[5] - t14 * m.data[4]);
        // Make sure the determinant is non-zero.
        if (t16 == 0.0f) return;
        float t17 = 1 / t16;
        data[0] = (m.data[4] * m.data[8] - m.data[5] * m.data[7]) * t17;
        data[1] = -(m.data[1] * m.data[8] - m.data[2] * m.data[7]) * t17;
        data[2] = (m.data[1] * m.data[5] - m.data[2] * m.data[4]) * t17;
        data[3] = -(m.data[3] * m.data[8] - m.data[5] * m.data[6]) * t17;
        data[4] = (m.data[0] * m.data[8] - t14) * t17;
        data[5] = -(t6 - t10) * t17;
        data[6] = (m.data[3] * m.data[7] - m.data[4] * m.data[6]) * t17;
        data[7] = -(m.data[0] * m.data[7] - t12) * t17;
        data[8] = (t4 - t8) * t17;
    }

    Matrix3x3 inverse() const
    {
        Matrix3x3 result;
        result.setInverse(*this);
        return result;
    }

    void invert()
    {
        setInverse(*this);
    }
}
```

The algebra for calculating the inverse of a 3-by-4 matrix is pretty long, so I will skip it, but I encourage you to check it [here](https://semath.info/src/inverse-cofactor-ex4.html).
As only square matrices have an inverse, we will have to add the fourth row to the matrix just like before. The resulting matrix will
also have a bottom row of $(0, 0, 0, 1)$, so we can ignore it. The code for calculating the inverse of a 3-by-4 matrix is as follows:

```cpp
class Matrix3x4
{
    // Other code here...
    
    float getDeterminant() const
    {
        return data[0] * data[5] * data[10]
            - data[0] * data[6] * data[9]
            - data[1] * data[4] * data[10]
            + data[1] * data[6] * data[8]
            + data[2] * data[4] * data[9]
            - data[2] * data[5] * data[8];
    }

    void setInverse(const Matrix3x4& m)
    {
        float det = getDeterminant();

        if (det == 0.0f) return;

        float invDet = 1 / det;

        data[0] = (m.data[5] * m.data[10] - m.data[6] * m.data[9]) * invDet;
        data[1] = (m.data[2] * m.data[9] - m.data[1] * m.data[10]) * invDet;
        data[2] = (m.data[1] * m.data[6] - m.data[2] * m.data[5]) * invDet;
        data[3] = (m.data[3] * m.data[6] * m.data[9] +
                   m.data[2] * m.data[5] * m.data[11] +
                   m.data[1] * m.data[7] * m.data[10] -
                   m.data[1] * m.data[6] * m.data[11] -
                   m.data[2] * m.data[7] * m.data[9] -
                   m.data[3] * m.data[5] * m.data[10]) * invDet;

        data[4] = (m.data[6] * m.data[8] - m.data[4] * m.data[10]) * invDet;
        data[5] = (m.data[0] * m.data[10] - m.data[2] * m.data[8]) * invDet;
        data[6] = (m.data[2] * m.data[4] - m.data[0] * m.data[6]) * invDet;
        data[7] = (m.data[3] * m.data[4] * m.data[10] +
                   m.data[2] * m.data[7] * m.data[8] +
                   m.data[0] * m.data[6] * m.data[11] -
                   m.data[3] * m.data[6] * m.data[8] -
                   m.data[2] * m.data[4] * m.data[11] -
                   m.data[0] * m.data[7] * m.data[10]) * invDet;

        data[8] = (m.data[4] * m.data[9] - m.data[5] * m.data[8]) * invDet;
        data[9] = (m.data[1] * m.data[8] - m.data[0] * m.data[9]) * invDet;
        data[10] = (m.data[0] * m.data[5] - m.data[1] * m.data[4]) * invDet;
        data[11] = (m.data[3] * m.data[5] * m.data[8] +
                    m.data[1] * m.data[4] * m.data[11] +
                    m.data[0] * m.data[7] * m.data[9] -
                    m.data[3] * m.data[4] * m.data[9] -
                    m.data[0] * m.data[5] * m.data[11] -
                    m.data[1] * m.data[7] * m.data[8]) * invDet;
    }

    Matrix3x4 inverse() const
    {
        Matrix3x4 result;
        result.setInverse(*this);
        return result;
    }

    void invert()
    {
        setInverse(*this);
    }
}
```

### Transpose

For getting the inverse of a 3-by-3 *rotation* matrix, we can use a much faster process. Its inverse represents a rotation about the same axis,
but opposite angle. It is the same as to invert the axis and use the same angle. And getting the inverted axis is as easy as swapping rows and column.
This operation gives us the **transpose** of a matrix.

$$
M
=
\begin{bmatrix}
    a & b & c \\
    d & e & f \\
    g & h & i
\end{bmatrix}
$$

$$
M^T
=
\begin{bmatrix}
    a & d & g \\
    b & e & h \\
    c & f & i
\end{bmatrix}
$$

If $M$ is a rotation matrix, then:

$$
M^T = M^{-1}
$$

Let's add the transpose function to our *Matrix3x3* class:

```cpp
class Matrix3x3
{
    // Other code here...
    
    void setTranspose(const Matrix3x3& m)
    {
        data[0] = m.data[0];
        data[1] = m.data[3];
        data[2] = m.data[6];
        data[3] = m.data[1];
        data[4] = m.data[4];
        data[5] = m.data[7];
        data[6] = m.data[2];
        data[7] = m.data[5];
        data[8] = m.data[8];
    }

    Matrix3x3 transpose() const
    {
        Matrix3x3 result;
        result.setTranspose(*this);
        return result;
    }
}
```

For a 3-by-4 matrix, there is no point in adding a *setTranspose* function, as it doesn't make much sense, considering the fourth
column is the translation component of the matrix.

### Changing Coordinate Systems

Let's add some utility functions for transforming vectors. When developing a game, we will often need to transform vectors from local to
world space and vice-versa. We will also need to transform directions, and not only positions. A direction is a vector that doesn't
represent a point in space, but a direction in space. For example, the vector $(1, 0, 0)$ represents a direction pointing to the right.
If we transform a direction by a matrix, the resulting vector will still be a direction, but pointing in a different direction. For example,
if we transform the direction $(1, 0, 0)$ by a rotation matrix that represents a rotation of 90 degrees about the $Z$ axis, the resulting
vector will be $(0, 1, 0)$, a direction pointing upwards.

As we have already implemented the position vector transformation, let's add a function for the inverse transformation:

```cpp
class Matrix3x4
{
    // Other code here...
    
    Vector3 transformInverse(const Vector3& vector) const
    {
        Vector3 tmp = vector;
        tmp.x -= data[3];
        tmp.y -= data[7];
        tmp.z -= data[11];
        return Vector3(
            tmp.x * data[0] + tmp.y * data[4] + tmp.z * data[8],
            tmp.x * data[1] + tmp.y * data[5] + tmp.z * data[9],
            tmp.x * data[2] + tmp.y * data[6] + tmp.z * data[10]
        );
    }
}
```

And functions for transforming directions:

```cpp
class Matrix3x4
{
    // Other code here...
    
    Vector3 transformDirection(const Vector3& vector) const
    {
        return Vector3(
            vector.x * data[0] + vector.y * data[1] + vector.z * data[2],
            vector.x * data[4] + vector.y * data[5] + vector.z * data[6],
            vector.x * data[8] + vector.y * data[9] + vector.z * data[10]
        );
    }

    Vector3 transformInverseDirection(const Vector3& vector) const
    {
        return Vector3(
            vector.x * data[0] + vector.y * data[4] + vector.z * data[8],
            vector.x * data[1] + vector.y * data[5] + vector.z * data[9],
            vector.x * data[2] + vector.y * data[6] + vector.z * data[10]
        );
    }
}
```

### Quaternion

As we have already discussed a **quaternion** is a four-dimensional vector that represents an orientation. This is the form that we will use
for storing the object's orientation. It is more efficient than a rotation matrix, as it uses less memory and is faster to compute. Let's
define a *Quaternion* class in *core.hpp*:

```cpp
class Quaternion
{
public:
    union {
        struct {
            float x;
            float y;
            float z;
            float w;
        };

        float data[4];
    };
    
    Quaternion() : x(0), y(0), z(0), w(1) {}
    
    Quaternion(const float x, const float y, const float z, const float w) : x(x), y(y), z(z), w(w) {}
};
```

As quaternions represent a rotation only when normalized, let's add a function for that as well:

```cpp
class Quaternion
{
    // Other code here...

    void normalize()
    {
        float det = x * x + y * y + z * z + w * w;
        if (det == 0.0f)
        {
            w = 1.0f;
            return;
        }

        float invDet = 1 / sqrt(det);
        x *= invDet;
        y *= invDet;
        z *= invDet;
        w *= invDet;
    }
}
```

To use the square root function we need to include the *math.h* header. Let's add it at the top of *core.hpp*:

```cpp
#pragma once
#include <math.h>

#ifndef CORE_HPP // include guard
#define CORE_HPP

// Other code here...
```

Just like combining two rotation matrices, we can also combine quaternions. The result of multiplying two quaternions is a quaternion
that represents the rotation of the second quaternion followed by the rotation of the first quaternion. Let's implement the formula
that we've discussed before:

```cpp
class Quaternion
{
    // Other code here...

    void operator*=(const Quaternion& multiplier)
    {
        Quaternion q = *this;
        x = q.w * multiplier.x + q.x * multiplier.w + q.y * multiplier.z - q.z * multiplier.y;
        y = q.w * multiplier.y + q.y * multiplier.w + q.z * multiplier.x - q.x * multiplier.z;
        z = q.w * multiplier.z + q.z * multiplier.w + q.x * multiplier.y - q.y * multiplier.x;
        w = q.w * multiplier.w - q.x * multiplier.x - q.y * multiplier.y - q.z * multiplier.z;
    }
}
```

Every frame we will be rotating the object using its angular velocity, so we will need a way to do that as well. Let's add a function
for rotating a quaternion by a scaled vector. The scaled vector represents the angular velocity multiplied by the time step.

```cpp
class Quaternion
{
    // Other code here...

    void addScaledVector(const Vector3& vector, float scale)
    {
        Quaternion q(vector.x * scale, vector.y * scale, vector.z * scale, 0);
        q *= *this;
        x += q.x * 0.5f;
        y += q.y * 0.5f;
        z += q.z * 0.5f;
        w += q.w * 0.5f;
    }
}
```

### Quaternion to Matrix

Quaternion is not as intuitive as a matrix, and it is not as easy to work with. We will use quaternions for storing the orientation
of objects, but we will use matrices for storing the transformation of objects. Looking ahead, we will need transformation
matrices for rendering purposes, so having a way to convert a quaternion to a matrix is very useful. Sometimes we will need only a
rotation matrix (3-by-3) and other times we will need a full 3-by-4 transformation matrix.

```cpp
class Matrix3x3
{
    // Other code here...
    
    void setOrientation(const Quaternion& q)
    {
        data[0] = 1 - (2 * q.y * q.y + 2 * q.z * q.z);
        data[1] = 2 * q.x * q.y + 2 * q.z * q.w;
        data[2] = 2 * q.x * q.z - 2 * q.y * q.w;
        data[3] = 2 * q.x * q.y - 2 * q.z * q.w;
        data[4] = 1 - (2 * q.x * q.x + 2 * q.z * q.z);
        data[5] = 2 * q.y * q.z + 2 * q.x * q.w;
        data[6] = 2 * q.x * q.z + 2 * q.y * q.w;
        data[7] = 2 * q.y * q.z - 2 * q.x * q.w;
        data[8] = 1 - (2 * q.x * q.x + 2 * q.y * q.y);
    }
}
```

And for the full transformation matrix:

```cpp
class Matrix3x4
{
    // Other code here...
    
    void setOrientationAndPos(const Quaternion& q, const Vector3& pos)
    {
        data[0] = 1 - (2 * q.y * q.y + 2 * q.z * q.z);
        data[1] = 2 * q.x * q.y + 2 * q.z * q.w;
        data[2] = 2 * q.x * q.z - 2 * q.y * q.w;
        data[3] = pos.x;

        data[4] = 2 * q.x * q.y - 2 * q.z * q.w;
        data[5] = 1 - (2 * q.x * q.x + 2 * q.z * q.z);
        data[6] = 2 * q.y * q.z + 2 * q.x * q.w;
        data[7] = pos.y;

        data[8] = 2 * q.x * q.z + 2 * q.y * q.w;
        data[9] = 2 * q.y * q.z - 2 * q.x * q.w;
        data[10] = 1 - (2 * q.x * q.x + 2 * q.y * q.y);
        data[11] = pos.z;
    }
}
```

For now that's it, but if this tiny amount of math piqued your interest, I highly recommend checking out [FGED Volume 1: Mathematics](https://foundationsofgameenginedev.com/)
by [Eric Lengyel](https://twitter.com/EricLengyel). It's a great book that covers almost all the necessary math for game development.

## Closing

With this we have finished implementing most mathematics for working in 3D. Even though there are a lot of published math libraries
that do the same and which we could use instead of implementing everything ourselves, it's crucial to understand how everything works.
This will help us in the future, when we will be implementing more advanced features. In the next part we will implement the 3D rigid body
physics.

Thanks for reading and if you have any thoughts/questions, I would love to hear them on twitter [@Snowblazed](https://twitter.com/Snowblazed).
