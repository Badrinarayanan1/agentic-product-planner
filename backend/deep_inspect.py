from pydantic_ai import Agent
import inspect

print("Agent dir:", dir(Agent))
try:
    print("Init sig:", inspect.signature(Agent.__init__))
except Exception as e:
    print("Could not get signature:", e)

print("Agent doc:", Agent.__doc__)
