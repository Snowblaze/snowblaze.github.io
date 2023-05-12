---
title: "Game Engine Tutorial Series Part 2: Simple Physics"
excerpt: "Physics is a huge discipline and lots of its areas might be useful in games, but when we talk about physics in a game, usually we refer to classical mechanics"
coverImage: "/SimplePhysics/simple-physics-cover.jpg"
date: "2022-10-15T17:00:00.000Z"
author: Arman Matinyan
ogImage: "/SimplePhysics/simple-physics-og.jpg"
readTime: "10 min"
previousSlug: "getting-started"
previousTitle: "Part 1: Introduction"
nextSlug: "collisions"
nextTitle: "Part 3: Collisions"
---

Physics is a huge discipline and lots of its areas might be useful in games, but when we talk about physics in a game, usually we refer to
classical mechanics. It is used to give objects in games the feel of being a solid entity, with mass, inertia, buoyancy and bounce. In this
part we'll limit ourselves to adding some simple physics calculations for gravity and make our character fall.

The source code is available on GitHub at [https://github.com/Snowblaze-Studio/game-engine](https://github.com/Snowblaze-Studio/game-engine).
The final code for this part of the tutorial can be found under the tag "part-2-simple-physics".

## Laws of motion

Newton discovered three laws of motion that describe how **point masses** behave and physics engines are based on them. A point mass is an
object that has mass, but has no size. This term is rarely used in game physics and instead such objects are called **particles**.

Prior to dealing with particles, we should redefine our *Vector2* struct to be a class in a separate from *Game.hpp* file. For that let's
create a folder in *external* named *physics-engine* and define our class in *core.hpp* file:

```cpp
#pragma once

#ifndef CORE_HPP // include guard
#define CORE_HPP

class Vector2
{
public:
    float x;
    float y;

public:
    Vector2() : x(0), y(0) {}

    Vector2(const float x, const float y) : x(x), y(y) {}

    void invert()
    {
        x = -x;
        y = -y;
    }
}

#endif
```

We'll be adding more functionality to the class as we go.

For defining particles we need to understand a couple of calculus concepts.

The differential of a quantity can be viewed as the rate that it is changing. For example, let's think about the position of a moving
object. In the next frame the position will be slightly different, and given two positions we can determine the rate it is changing over
time, a.k.a. **velocity**. This can be expressed as:

$$
v = \frac{p' - p}{Δt} = \frac{Δp}{Δt}
$$

To get the exact velocity of the object, we need to minimize the time passed. In math, this is expressed with limit notation:

$$
v = \lim\limits_{t→0}\frac{Δp}{Δt}
$$

Instead of using this notation, more commonly this is written like so:

$$
v = \lim\limits_{t→0}\frac{Δp}{Δt} = \frac{dp}{dt}
$$

As it is common to observe some change with respect to time, we can simplify the above like this:

$$
v = \lim\limits_{t→0}\frac{Δp}{Δt} = \frac{dp}{dt} = \dot{p}
$$

The same goes for **acceleration**. It is the rate that velocity is changing. In physics, acceleration can mean both positive and negative
values. Positive acceleration represents speeding up, negative - slowing down, and zero value means that velocity doesn't change.

$$
a = \lim\limits_{t→0}\frac{Δv}{Δt} = \frac{dv}{dt} = \frac{d}{dt}\frac{dp}{dt} = \frac{d^2p}{dt^2} = \ddot{p}
$$

Let's put our *Particle* class in a corresponding header file named *particle.hpp*:

```cpp
#pragma once

#ifndef PARTICLE_HPP // include guard
#define PARTICLE_HPP

#include "core.hpp"

class Particle
{
protected:
    // Holds the position of the particle in world space
    Vector2 position;

    // Holds the linear velocity of the particle in world space
    Vector2 velocity;

    // Holds the acceleration of the particle
    Vector2 acceleration;
};

#endif
```

### The First Law

The first law tells us that an object will continue to move with a constant velocity unless a force acts upon it. In other words, the
velocity will never change. In real world, though, the closest phenomenon to that is how objects behave in space. Most of the time some
forces act on a body, something like drag forces. We will incorporate some rough approximation in our engine to make sure objects don't
accelerate because of processor inaccuracies. Let's call this form of drag **damping** and add a corresponding field to our *Particle* class:

```cpp
class Particle
{
protected:
    // Other code here...

    float damping;
};
```

At each update we will be removing some portion of the object's velocity. If drag is 1, velocity won't change, and if drag is 0, the
object won't be able to move without a force.

### The Second Law

The second law tells us how forces affect the motion of an object. They change its acceleration. Because of this law, acceleration should
be treated differently to the velocity and position. Latter two change by the process of integration, but acceleration can be different
at any moment. We can directly set the acceleration, and the behaviour will still look fine. Because of this, acceleration will be left
alone by the integrator, while the other two will not.

## Adding forces

The same force, affects two objects differently depending on their mass. The well-known formula is:

$$
f = ma
$$

As the acceleration is the second derivative of position, let's rewrite the same formula in another form in terms of force:

$$
\ddot{p} = \frac{1}{m}f
$$

Now let's add mass to our particle definition. Each particle needs its own mass. But, we've got a problem. If the mass is zero, then
any force will generate infinite acceleration. However, sometimes we want to simulate infinite masses, such objects aren't affected by
forces. For example, they could be useful when making floors, walls and anything that should stay in place. This will work if these
objects don't have an initial velocity.

Although, we can't represent a true infinity in code, we can use a neat little trick. Storing 1 over the mass will fix both our problems.
This is called **inverse mass**. Infinite mass objects have a zero inverse mass, zero mass objects should have an infinite inverse mass,
which is impossible to set in code.

```cpp
class Particle
{
protected:
    // Other code here...

    float inverseMass;
};
```

Let's also add some convenience functions.

```cpp
class Particle
{
protected:
    // Other code here...

public:
    void setMass(const float value)
    {
        inverseMass = 1.0f / value;
    }

    void setInverseMass(const float value)
    {
        inverseMass = value;
    }
};
```

Most of the time we will be using the *setMass* function, as it is more straightforward.

## Gravity

Gravity is the most important force in a physics engine. It applies between every pair of objects, attracting them together with a force
that depends on their mass and distance. The following is the formula Newton developed.

$$
f = G\frac{m_1m_2}{r^2}
$$

where $m_1$ and $m_2$ are the masses, $r$ is the distance between their centers and $G$ is the "universal gravitational constant".

Using this formula we can see that the effects of gravity between 2 huge objects, such as the size of a planet, are significant, while
for 2 small objects like a ball and a rock the effects are small. In our engine we can neglect the gravitational forces between small
objects and only take into account the forces between each object and the ground. We can simplify our formula assuming that the mass
of the Earth as well as the distance to its center are constant.

$$
f = mg
$$

where $m$ is the mass of the object and $g$ is a constant.

$$
g = G\frac{m_{earth}}{r^2}
$$

On our planet this constant is approximately $9.81ms^{-2}$. If we work out the acceleration using this force, we get:

$$
\ddot{p} = \frac{1}{m}mg = g
$$

No matter what mass an object has, it will always accelerate at the same rate due to gravity. There is no point in always calculating
this acceleration, so we will just use a constant value. But using the real value of $9.81ms^{-2}$ can look dull in games, so we will
be tweaking the value based on the feeling we want to get. For now let's create *Core.cpp* file and set the gravity there:

```cpp
#include "include/core.hpp"

const Vector2 Vector2::GRAVITY = Vector2(0, -9.81f);
```

As the gravity acts in vertical direction, we set the acceleration on Y-axis.

## Physics Update

With all of the above described, we can now implement physics update process, which will be done by the **integrator**. The update
function will consist of two parts:

- updating the position of an object
- updating its velocity

Position depends both on the velocity and the acceleration, while velocity depends only on the acceleration. Also, the integrate
function requires some elapsed time between frames, a.k.a. **delta time**. Now let's create the *integrate* function in *particle.hpp*
and fill it in.

```cpp
class Particle
{
public:
    // Other code here...

    void integrate(float deltaTime)
    {

    }
};
```

One more thing we have left to do is define some *Vector2* operations.

```cpp
class Vector2
{
public:
    // Other code here...

    void addScaledVector(const Vector2& vector, float scale)
    {
        x += vector.x * scale;
        y += vector.y * scale;
    }
    
    void operator*=(const float value)
    {
        x *= value;
        y *= value;
    }
}
```

### Position Update

Just as the acceleration is the second derivative of the position, the position is the second integral of the acceleration. Thus, we
get the following formula for calculating the position:

$$
p' = p + \dot{p}t + \frac{1}{2}\ddot{p}t^2
$$

The code will look something like this:

```cpp
void integrate(float deltaTime)
{
    position.addScaledVector(velocity, deltaTime);
    position.addScaledVector(acceleration, deltaTime * deltaTime * 0.5);
}
```

Actually, the acceleration will not have much of an impact, because half of the squared time at 30 FPS is 0.0005. For this reason we
can just ignore the acceleration altogether.

$$
p' = p + \dot{p}t
$$

And the updated *integrate* function will look like this:

```cpp
void integrate(float deltaTime)
{
    position.addScaledVector(velocity, deltaTime);
}
```

### Velocity Update

For calculating velocity, besides using the acceleration, we are going to add in damping to remove a bit of velocity at each frame.

$$
\dot{p}' = \dot{p}d + \ddot{p}t
$$

where $d$ is the damping.

This formula appears to have a hidden problem. Velocity dampens at each frame by the same factor, so under different conditions object
will have different drag. To solve this, we will make damping depend on time, even though calculating a float to the power of another
one is a relatively slow operation.

```cpp
void integrate(float deltaTime)
{
    // Skip integrating objects with infinite mass
    if (inverseMass <= 0.0) return;
    
    assert(deltaTime > 0.0);

    // Update position
    position.addScaledVector(velocity, deltaTime);
    
    Vector2 resultingAcceleration = acceleration;
    
    // Update velocity
    velocity.addScaledVector(resultingAcceleration, deltaTime);
    
    // Impose drag
    velocity *= powf(damping, deltaTime);
}
```

Many engine developers tend to just use a damping value very close to 1, so that for the player it will not be noticeable, but still
solving the numerical instability problem.

To see the gravity working we have to make a couple changes to our character.

Firstly, let's remove the *mCharacterPos* and *mMovementDir* from the *Game.hpp*. And create a particle object *mCharacter* instead.

```cpp
#pragma once

#ifndef GAME_HPP // include guard
#define GAME_HPP

#include <SDL.h>
#include <particle.hpp>

class Game
{
public:
    // Other code here...

private:
    // Other code here...

    Particle* mCharacter;
};

#endif
```

Next thing to do is to initialize the particle and set its position to the center of our window:

```cpp
#include "Game.hpp"
#include <particle.hpp>

Game::Game() : mWindow(nullptr), mRenderer(nullptr), mTicksCount(0), mIsRunning(true) {}

bool Game::Initialize()
{
	// Other code here...

	mCharacter = new Particle();

	float x = (1024.0f - 100.0f) / 2.0f;
	float y = (768.0f - 100.0f) / 2.0f;

	mCharacter->setPosition(x, y);

	return true;
}
```

Setting the position of a particle is not yet defined in *particle.hpp*, so let's define and implement it. Also, we will add a function
for getting the position.

```cpp
class Particle
{
    protected:
    // Other code here...

    public:
    // Other code here...

    void setPosition(const Vector2& value)
    {
        position = value;
    }

    void setPosition(const float x, const float y)
    {
        position.x = x;
        position.y = y;
    }

    void getPosition(Vector2* positionPtr) const
    {
        *positionPtr = position;
    }

    Vector2 getPosition() const
    {
        return position;
    }
};
```

Now we can update the drawing part:

```cpp
void Game::GenerateOutput()
{
	// Other code here...

	// Draw the character
	Vector2 currentPosition = mCharacter->getPosition();

	SDL_Rect character{
		static_cast<int>(currentPosition.x - 50),
		static_cast<int>(currentPosition.y - 50),
		100,
		100,
	};
	
	// Other code here...
}
```

For now let's remove all the code related to processing input and moving the character from *ProcessInput* and *UpdateGame* functions.
Instead, let's integrate our particle on every *UpdateGame* like so:

```cpp
void Game::UpdateGame()
{
	// Wait until 16ms has elapsed since last frame
	while (!SDL_TICKS_PASSED(SDL_GetTicks(), mTicksCount + 16));

	// Delta time is the difference in ticks from last frame
	// (converted to seconds)
	float deltaTime = (SDL_GetTicks() - mTicksCount) / 1000.0f;

	// Update tick counts (for next frame)
	mTicksCount = SDL_GetTicks();

	// Clamp maximum delta time value
	if (deltaTime > 0.05f)
	{
		deltaTime = 0.05f;
	}

	mCharacter->integrate(deltaTime);
}
```

Even though we have made all these changes, our gravity simulation will not work yet, because the character doesn't have the required
attributes set:

```cpp
bool Game::Initialize()
{
    // Other code here...

	mCharacter->setMass(1.0);
	mCharacter->setAcceleration(Vector2::GRAVITY);
	mCharacter->setDamping(0.99);

	return true;
}
```

These setter functions are missing from our particle implementation:

```cpp
class Particle
{
protected:
    // Other code here...

public:
    void setDamping(const float value)
    {
        damping = value;
    }

    float getDamping() const
    {
        return damping;
    }
    
    void setAcceleration(const Vector2& value)
    {
        acceleration = value;
    }

    void setAcceleration(const float x, const float y)
    {
        acceleration.x = x;
        acceleration.y = y;
    }
    
    // Other code here...
}
```

Lastly, for all of this to work we need to build our physics library and add it in the *CMakeLists.txt* of the *external* folder.
Create a *CMakeLists.txt* in the *external/physics-engine* folder and add the following lines:

```cmake
# CMakeList.txt : CMake project for game-engine, include source and define
# project specific logic here.
#
cmake_minimum_required (VERSION 3.21)

add_library (PhysicsEngine core.cpp)
target_include_directories (PhysicsEngine INTERFACE "${CMAKE_CURRENT_SOURCE_DIR}/include")
```

To update the *external* cmake file, replace its contents with this:

```cmake
add_library(external INTERFACE)

add_subdirectory(SDL)
target_link_libraries(external INTERFACE SDL2-static)

add_subdirectory (physics-engine)
target_link_libraries(external INTERFACE PhysicsEngine)
```

Running the project shows our character free-falling, but very slowly. The reason for that is our unit system. The way we defined our
world is that each pixel equals 1 unit. We will come back to this issue in another blog post, where we will fix our unit system and make
it easily configurable.

## Closing
We have explored the primary laws of classical mechanics and managed to implement them in the form of a very simplistic physics library.
In the next part we will add collisions, so that our character doesn't fall through the bottom border of our window, making it our ground.

Thanks for reading and if you have any thoughts/questions, I would love to hear them on twitter: [@Snowblazed](https://twitter.com/Snowblazed).

