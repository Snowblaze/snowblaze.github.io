---
title: "Game Engine Tutorial Series Part 5: Rigid Body"
excerpt: "Rigid body physics is a very important part of any game engine. It's the foundation of all physics simulations. As such in this part of the tutorial we will upgrade our physics library to rigid body physics"
coverImage: "/RigidBody/rigidbody-cover.jpg"
date: "2023-06-19T00:30:00.000Z"
author: Arman Matinyan
ogImage: "/RigidBody/rigidbody-og.jpg"
readTime: "30 min"
previousSlug: "rotation"
previousTitle: "Part 4: Rotation"
---

Rigid body physics is a very important part of any game engine. It's the foundation of all physics simulations. As such in this part of the tutorial
we will upgrade our physics library to rigid body physics, handle 3D operations taking into consideration the volume of our objects and create a
simple example scene for testing purposes.

The source code is available on GitHub at [https://github.com/Snowblaze-Studio/game-engine](https://github.com/Snowblaze-Studio/game-engine).
The final code for this part of the tutorial can be found under the tag "part-5-rigidbody".

## Preparation

As usual, before we dive into the topic and its implementation, let's get the required data and math out of the way. Let's add
a static vector pointing in the positive X direction in *core.hpp*.

```cpp
class Vector3
{
public:
    // Other code here...

    const static Vector3 RIGHT;
}
```

And it's initialization in *core.cpp*.

```cpp
#include "include/core.hpp"

const Vector3 Vector3::GRAVITY = Vector3(0, -9.81f, 0);
const Vector3 Vector3::UP = Vector3(0, 1.0f, 0);
const Vector3 Vector3::RIGHT = Vector3(1.0f, 0, 0);
```

Sometimes we have two vectors, and we need to find a vector that's perpendicular to both of them. This operation is called **cross product**.
It gets its name from the symbol used to denote it, which is a cross $\times$. Because the result of this operation is a vector, it's also
called **vector product**.

$$
a \times b = \begin{bmatrix} a_y b_z - a_z b_y \\ a_z b_x - a_x b_z \\ a_x b_y - a_y b_x \end{bmatrix}
$$

The magnitude of the resulting vector is equal to the area of the parallelogram formed by the two vectors and is calculated with the following formula.

$$
|a \times b| = |a| |b| \sin \theta
$$

Other than that cross product is not commutative. Reversing the order of the operands changes the direction of the result. For now these are the
only properties of the cross product that we need to know. We will learn more about it in the future. Let's add a static method to the *Vector3*
class that will calculate the cross product of two vectors.

```cpp
class Vector3
{
public:
    // Other code here...

    static Vector3 cross(const Vector3& a, const Vector3& b)
    {
        return Vector3(a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x);
    }
}
```

With the required math in place, it's time to introduce rigid body physics to our game engine.

## Rigid Body

Rigid body physics is a type of physics simulation that assumes that all objects are rigid, meaning that they don't deform or change their shape.
This is a very good approximation for most objects in the real world.

In the previous part of the series we have implemented the *Particle* class. It's a good start, but it's not enough for a rigid body simulation.
We need to add some additional fields and methods to it. Let's start by creating a new class called *RigidBody*. In the *physics-engine/include*
folder create *rigidbody.hpp* file and a *RigidBody* class inside it.

```cpp
#pragma once

#ifndef RIGIDBODY_HPP // include guard
#define RIGIDBODY_HPP

#include "core.hpp"
#include <assert.h>
#include <math.h>

class RigidBody
{
protected:
    // Same fields as in the Particle class, but with damping renamed to linearDamping...

    Quaternion orientation;

    Vector3 angularVelocity;

    Matrix3x4 transformMatrix;

public:
    // Same methods as in the Particle class, but with setDamping and getDamping methods renamed to setLinearDamping and getLinearDamping...
    
    void setOrientation(const Quaternion& value)
    {
        orientation = value;
        orientation.normalize();
    }

    void setOrientation(const float x, const float y, const float z, const float w)
    {
        orientation.x = x;
        orientation.y = y;
        orientation.z = z;
        orientation.w = w;
        orientation.normalize();
    }

    void getOrientation(Quaternion* orientationPtr) const
    {
        *orientationPtr = orientation;
    }

    Quaternion getOrientation() const
    {
        return orientation;
    }
};

#endif
```

The matrix here is used to store the transformation of the rigid body. It's calculated from the position and orientation of the rigid body
every frame. For sure, we can always create the matrix whenever we need it, but it's convenient to cache it in a field, as it is going to be
used multiple times per frame.

Besides transformation matrix, every frame we will need to normalize the rigid body's orientation, because it may have changed during the
frame. Now let's add the function that will do that.

```cpp
class RigidBody
{
public:
    // Other code here...

    void calculateDerivedData()
    {
        orientation.normalize();

        _calculateTransformMatrix(transformMatrix, position, orientation);
    }
    
private:
    void _calculateTransformMatrix(Matrix3x4& transformMatrix, const Vector3& position, const Quaternion& orientation)
    {
        transformMatrix.data[0] = 1.0f - 2.0f * orientation.y * orientation.y - 2.0f * orientation.z * orientation.z;
        transformMatrix.data[1] = 2.0f * orientation.x * orientation.y + 2.0f * orientation.z * orientation.w;
        transformMatrix.data[2] = 2.0f * orientation.x * orientation.z - 2.0f * orientation.y * orientation.w;
        transformMatrix.data[3] = position.x;

        transformMatrix.data[4] = 2.0f * orientation.x * orientation.y - 2.0f * orientation.z * orientation.w;
        transformMatrix.data[5] = 1.0f - 2.0f * orientation.x * orientation.x - 2.0f * orientation.z * orientation.z;
        transformMatrix.data[6] = 2.0f * orientation.y * orientation.z + 2.0f * orientation.x * orientation.w;
        transformMatrix.data[7] = position.y;

        transformMatrix.data[8] = 2.0f * orientation.x * orientation.z + 2.0f * orientation.y * orientation.w;
        transformMatrix.data[9] = 2.0f * orientation.y * orientation.z - 2.0f * orientation.x * orientation.w;
        transformMatrix.data[10] = 1.0f - 2.0f * orientation.x * orientation.x - 2.0f * orientation.y * orientation.y;
        transformMatrix.data[11] = position.z;
    }
};
```

## Torque and Moment of Inertia

In [Part 2](./simple-physics) to calculate the velocity of a particle we used the force acting on it and its mass. For rotation,
we will need to use **torque** instead of force and **moment of inertia** instead of mass. Torque is a force that causes rotation. Moment of inertia
is a measure of an object's resistance to changes in its rotation rate. It depends on the shape of the object and its mass distribution.

$$
\ddot{\theta} = I^{-1}\tau
$$

where $\ddot{\theta}$ is the angular acceleration, $\tau$ is the torque and $I$ is the moment of inertia.

Torques are very closely related to forces. Force can be converted into a torque, and vice versa. The torque $\tau$ is defined as the cross
product of the force $f$ and the vector $p_f$ from the object's origin to the point where the force is applied.

$$
\tau = p_f \times f
$$

All the forces applied to an object generate both linear and angular accelerations. Although, there is an exception: if the direction of the
force is through the object's center of mass, it will only generate linear acceleration. In this case, the torque is zero.

In 3D, as the object can freely rotate about any axis, we represent torques as a scaled axis. In other words, we represent a torque as a vector
that points in the direction of the axis of rotation and whose magnitude is equal to the magnitude of the torque.

$$
\tau = ad
$$

where $d$ is the axis of rotation and $a$ is the magnitude of the torque.

With torque defined, we can now move on to the moment of inertia. As we said, it is the rotation equivalent of mass. It is a measure of how
difficult it is to change the angular velocity of an object. The moment of inertia depends on the mass of the object and how the mass is
distributed relative to the axis of rotation. It is defined as:

$$
I = \sum_{i=1}^{n} m_i r_i^2
$$

where $m_i$ is the mass of the $i$-th particle and $r_i$ is the distance from the $i$-th particle to the axis of rotation.

It is clear that the moment of inertia depends on the axis of rotation, and as there are an infinite number of axes, we can't use a single
value for it, like we did with mass. Instead, we will use a 3x3 matrix and call it **inertia tensor**. The elements lying along the diagonal
represent the moment of inertia about the three principal axes of rotation. Other elements are called the products of inertia. They are zero
when the rigid body is symmetrical about the principal axes of rotation, like for a rectangular box. To calculate the products:

$$
I_{ab} = \sum_{i=1}^{n} m_i a_i b_i
$$

where $a_i$ is the distance of particle $i$ from the center of mass in the direction of $a$ and $b_i$ in the direction of $b$.

We can use this formula to calculate $I_{xy}$, $I_{xz}$ and $I_{yz}$. And finally we can put together our inertia tensor:

$$
I =
\begin{bmatrix}
I_{xx} & I_{xy} & I_{xz} \\
I_{xy} & I_{yy} & I_{yz} \\
I_{xz} & I_{yz} & I_{zz}
\end{bmatrix}
$$

Having products of inertia produces physically realistic, but no so intuitive results and our players may be confused. So, we can use a
simplified version, where only diagonal elements are present:

$$
I =
\begin{bmatrix}
I_{xx} & 0 & 0 \\
0 & I_{yy} & 0 \\
0 & 0 & I_{zz}
\end{bmatrix}
$$

For linear motion, we used the inverse of the mass, $m^{-1}$, to calculate the acceleration. For the same reasons, we will use the inverse
of the inertia tensor, $I^{-1}$, to calculate the angular acceleration.

```cpp
class RigidBody
{
protected:
    // Other code here...

    Matrix3x3 inverseInertiaTensor;
    
public:
    // Other code here...

    void setInertiaTensor(const Matrix3x3& value)
    {
        inverseInertiaTensor.setInverse(value);
    }

    void getInertiaTensor(Matrix3x3* inertiaTensorPtr) const
    {
        inertiaTensorPtr->setInverse(inverseInertiaTensor);
    }

    Matrix3x3 getInertiaTensor() const
    {
        Matrix3x3 inertiaTensor;
        getInertiaTensor(&inertiaTensor);
        return inertiaTensor;
    }

    void setInverseInertiaTensor(const Matrix3x3& value)
    {
        inverseInertiaTensor = value;
    }

    void getInverseInertiaTensor(Matrix3x3* inverseInertiaTensorPtr) const
    {
        *inverseInertiaTensorPtr = inverseInertiaTensor;
    }

    Matrix3x3 getInverseInertiaTensor() const
    {
        return inverseInertiaTensor;
    }
};
```

Considering the fact that it will be easier to work with world space torques and inertia tensors, we will need to convert them from local
space to world space. Let's add a field for the inverse inertia tensor in world space and ways to access it.

```cpp
class RigidBody
{
protected:
    // Other code here...

    Matrix3x3 inverseInertiaTensorWorld;

public:
    // Other code here...

    void getInertiaTensorWorld(Matrix3x3* inertiaTensorPtr) const
    {
        inertiaTensorPtr->setInverse(inverseInertiaTensorWorld);
    }

    Matrix3x3 getInertiaTensorWorld() const
    {
        Matrix3x3 it;
        getInertiaTensorWorld(&it);
        return it;
    }

    void getInverseInertiaTensorWorld(Matrix3x3* inverseInertiaTensorPtr) const
    {
        *inverseInertiaTensorPtr = inverseInertiaTensorWorld;
    }

    Matrix3x3 getInverseInertiaTensorWorld() const
    {
        return inverseInertiaTensorWorld;
    }
};
```

This tensor will depend on the orientation of the rigid body, so we will need to recalculate it every frame. Let's add this to
*calculateDerivedData* function.

```cpp
class RigidBody
{
public:
    // Other code here...

    void calculateDerivedData()
    {
        orientation.normalize();

        _calculateTransformMatrix(transformMatrix, position, orientation);

        _transformInertiaTensor(inverseInertiaTensorWorld, orientation, inverseInertiaTensor, transformMatrix);
    }

private:
    // Other code here...

    void _transformInertiaTensor(Matrix3x3& iitWorld, const Quaternion& q, const Matrix3x3& iitBody, const Matrix3x4& rotmat)
    {
        float t4 = rotmat.data[0] * iitBody.data[0] + rotmat.data[1] * iitBody.data[3] + rotmat.data[2] * iitBody.data[6];
        float t9 = rotmat.data[0] * iitBody.data[1] + rotmat.data[1] * iitBody.data[4] + rotmat.data[2] * iitBody.data[7];
        float t14 = rotmat.data[0] * iitBody.data[2] + rotmat.data[1] * iitBody.data[5] + rotmat.data[2] * iitBody.data[8];
        float t28 = rotmat.data[4] * iitBody.data[0] + rotmat.data[5] * iitBody.data[3] + rotmat.data[6] * iitBody.data[6];
        float t33 = rotmat.data[4] * iitBody.data[1] + rotmat.data[5] * iitBody.data[4] + rotmat.data[6] * iitBody.data[7];
        float t38 = rotmat.data[4] * iitBody.data[2] + rotmat.data[5] * iitBody.data[5] + rotmat.data[6] * iitBody.data[8];
        float t52 = rotmat.data[8] * iitBody.data[0] + rotmat.data[9] * iitBody.data[3] + rotmat.data[10] * iitBody.data[6];
        float t57 = rotmat.data[8] * iitBody.data[1] + rotmat.data[9] * iitBody.data[4] + rotmat.data[10] * iitBody.data[7];
        float t62 = rotmat.data[8] * iitBody.data[2] + rotmat.data[9] * iitBody.data[5] + rotmat.data[10] * iitBody.data[8];

        iitWorld.data[0] = t4 * rotmat.data[0] + t9 * rotmat.data[1] + t14 * rotmat.data[2];
        iitWorld.data[1] = t4 * rotmat.data[4] + t9 * rotmat.data[5] + t14 * rotmat.data[6];
        iitWorld.data[2] = t4 * rotmat.data[8] + t9 * rotmat.data[9] + t14 * rotmat.data[10];
        iitWorld.data[3] = t28 * rotmat.data[0] + t33 * rotmat.data[1] + t38 * rotmat.data[2];
        iitWorld.data[4] = t28 * rotmat.data[4] + t33 * rotmat.data[5] + t38 * rotmat.data[6];
        iitWorld.data[5] = t28 * rotmat.data[8] + t33 * rotmat.data[9] + t38 * rotmat.data[10];
        iitWorld.data[6] = t52 * rotmat.data[0] + t57 * rotmat.data[1] + t62 * rotmat.data[2];
        iitWorld.data[7] = t52 * rotmat.data[4] + t57 * rotmat.data[5] + t62 * rotmat.data[6];
        iitWorld.data[8] = t52 * rotmat.data[8] + t57 * rotmat.data[9] + t62 * rotmat.data[10];
    }
};
```

## Adding Forces

For particles, we discussed that multiple forces acting on it, may be combined into a single force. For rigid bodies, we will
do the same thing, and to top it off, torques can be combined in a similar manner. Not all the forces generate torque. When the force's
direction passes through the center of mass, it will not generate torque. For example, gravity will not generate torque. Let's add
a function to apply forces to the rigid body.

```cpp
class RigidBody
{
protected:
    // Other code here...

    Vector3 forceAccum;

public:
    // Other code here...
    
    void addForce(const Vector3& force)
    {
        forceAccum += force;
    }
};
```

Let's add a function for applying torque as well.

```cpp
class RigidBody
{
protected:
    // Other code here...

    Vector3 torqueAccum;
    
public:
    // Other code here...
    
    void addTorque(const Vector3& torque)
    {
        torqueAccum += torque;
    }
};
```

We will also need a function to clear the accumulators. This will be called after each integration step.

```cpp
class RigidBody
{
public:
    // Other code here...

    void clearAccumulators()
    {
        forceAccum.clear();
        torqueAccum.clear();
    }
};
```

What if a force is applied at a point other than the center of mass? Now both a force and a torque will be generated. Let's add a function
to apply a force at a point.

```cpp
class RigidBody
{
public:
    // Other code here...

    void addForceAtPoint(const Vector3& force, const Vector3& point)
    {
        Vector3 pt = point;
        pt -= position;

        forceAccum += force;
        torqueAccum += Vector3::cross(pt, force);
    }

    void addForceAtBodyPoint(const Vector3& force, const Vector3& point)
    {
        Vector3 pt = getPointInWorldSpace(point);
        addForceAtPoint(force, pt);
    }

    Vector3 getPointInWorldSpace(const Vector3& point) const
    {
        return transformMatrix.transform(point);
    }
};
```

All the functionality for applying forces and torques is now in place. It's time to implement the integration step.

## Integrating the Rigid Body

The integration step for rigid bodies is similar to the integration step for particles. The only difference is that we need to
calculate the angular acceleration and angular velocity. But first let's add a field for angular damping (similar to linear case).
When implementing the new collision resolution code, we will need to access the last frame's acceleration. Let's add that here as well.

```cpp
class RigidBody
{
protected:
    // Other code here...

    float angularDamping;
    
    Vector3 lastFrameAcceleration;

public:
    // Other code here...

    void setAngularDamping(const float value)
    {
        angularDamping = value;
    }

    float getAngularDamping() const
    {
        return angularDamping;
    }
    
    void getLastFrameAcceleration(Vector3* accelerationPtr) const
    {
        *accelerationPtr = lastFrameAcceleration;
    }

    Vector3 getLastFrameAcceleration() const
    {
        return lastFrameAcceleration;
    }
};
```

Finally, let's update the integration function, to include the angular acceleration and angular velocity.

```cpp
class RigidBody
{
public:
    // Other code here...
    
    void integrate(float deltaTime)
    {
        // Calculate linear acceleration
        lastFrameAcceleration = acceleration;
        lastFrameAcceleration.addScaledVector(forceAccum, inverseMass);

        // Calculate angular acceleration
        Vector3 angularAcceleration = inverseInertiaTensorWorld.transform(torqueAccum);

        // Update linear velocity
        velocity.addScaledVector(lastFrameAcceleration, deltaTime);

        // Update angular velocity
        angularVelocity.addScaledVector(angularAcceleration, deltaTime);

        // Impose drag
        velocity *= powf(linearDamping, deltaTime);
        angularVelocity *= powf(angularDamping, deltaTime);

        // Update position
        position.addScaledVector(velocity, deltaTime);

        // Update orientation
        orientation.addScaledVector(angularVelocity, deltaTime);

        // Update cached data
        calculateDerivedData();

        // Clean up
        clearAccumulators();
    }
};
```

## Demo

Now that we have working rigid body physics, we can use it to create a simple demo. We will add a force that pushes our rectangular
character up and rotates it clockwise. In *Game.hpp* update the includes.

```cpp
#include <particle.hpp>
#include <rigidbody.hpp>
#include <pcontactresolver.hpp>
#include <pcontactgenerator.hpp>
```

Update our character's declaration to use the newly created *RigidBody* class.

```cpp
class Game
{
private:
    // Other code here...

    RigidBody* mCharacter;
}
```

In *Game.cpp* replace the code for initializing the character with the following:

```cpp
bool Game::Initialize()
{
    // Other code here...
    
    mCharacter = new RigidBody();

	float x = WINDOW_WIDTH / 2.0f;
	float y = WINDOW_HEIGHT / 2.0f;
	float z = 0.0f;

	mCharacter->setPosition(x, y, z);
	mCharacter->setOrientation(0.0f, 0.0f, 0.0f, 1.0f);
	mCharacter->setMass(1.0);
	mCharacter->setAcceleration(Vector3::GRAVITY);
	mCharacter->setLinearDamping(0.99);
	mCharacter->setAngularDamping(0.99);
	mCharacter->setInertiaTensor(Matrix3x3(0.3f * 500.0f, 0, 0, 0, 0.3f * 500.0f, 0, 0, 0, 0.3f * 500.0f));

	mCharacter->clearAccumulators();
	mCharacter->calculateDerivedData();
	
	// Other code here...
}
```

Here, we set the inertia tensor to be a diagonal matrix with the same value for each element. This will make the character rotate
around its center.

Next, let's add a force that pushes the character up and rotates it clockwise. In *Game.cpp* add the following code to the
*ProcessInput* function to apply force on pressing the spacebar.

```cpp
void Game::ProcessInput()
{
    // Other code here...

	if (state[SDL_SCANCODE_SPACE])
	{
		Vector3 currentPosition = mCharacter->getPosition();
		Vector3 point = Vector3(currentPosition.x - 50.0f, currentPosition.y - 50.0f, 0.0f);
		mCharacter->addForceAtPoint(Vector3::UP * 250.0f, point);
	}
}
```

Due to limitation with our current rendering library, we will have to draw the character as we did before and to demonstrate the
rotation, we will draw a line that starts at the center of mass (origin). This line will show where our character is pointing to.
In *Game.cpp* add the following code to the *GenerateOutput* function.

```cpp
void Game::GenerateOutput()
{
	// Set color
	SDL_SetRenderDrawColor(mRenderer, 0, 0, 255, 255);

	// Clear the back buffer
	SDL_RenderClear(mRenderer);

	// Set the character's color
	SDL_SetRenderDrawColor(mRenderer, 255, 255, 255, 255);

	// Draw the character
	Vector3 currentPosition = mCharacter->getPosition();

	SDL_Rect character = {
		static_cast<int>(WINDOW_WIDTH - (currentPosition.x + 50)),
		static_cast<int>(WINDOW_HEIGHT - (currentPosition.y + 50)),
		100,
		100,
	};
	SDL_RenderFillRect(mRenderer, &character);

	SDL_SetRenderDrawColor(mRenderer, 255, 0, 0, 255);

	Vector3 pointWS = mCharacter->getPointInWorldSpace(Vector3(0.0f, 50.0f, 0.0f));
	SDL_RenderDrawLine(mRenderer, WINDOW_WIDTH - currentPosition.x, WINDOW_HEIGHT - currentPosition.y, WINDOW_WIDTH - pointWS.x, WINDOW_HEIGHT - pointWS.y);

	// Swap the front and back buffers
	SDL_RenderPresent(mRenderer);
}
```

Run the game and press the spacebar to see the character rotate around its center. With the code we have written so far, pressing spacebar
applies the force multiple times, because the game is so fast that the input is processed in multiple consecutive frames. We will skip fixing
it for now, as we will be changing our input system later in the series.

## Closing

We are almost at the finish line in terms of creating a simple 3D rigid body physics simulation. Although, we still can't define object shapes
and their collisions. In [Part 3](./collisions) we have implemented a simple collision detection system for particles, but now we need a full
3D collisions detection and resolution. And that's exactly what we will be doing in the next part.

Thanks for reading and if you have any thoughts/questions, I would love to hear them on twitter [@Snowblazed](https://twitter.com/Snowblazed).
